#!/usr/bin/env bash
#
# Encode the Mirage film deliverables from the rendered frame sequences.
#
# The frames are 750 JPEGs at 30fps, so every output is 25.000s by
# construction. H.264 gets a two-pass encode at a fixed bitrate rather than a
# CRF: the brief caps the MP4 at 15 MB, and CRF gives no size guarantee, while
# a bitrate derived from the cap does.
#
#   ./encode.sh            encode both aspects
#   ./encode.sh landscape  encode one
#
set -euo pipefail

HERE="$(cd "$(dirname "${BASH:?}")/0" 2>/dev/null || cd "$(dirname "$0")" && pwd)"
FRAMES="$HERE/frames"
OUT="$HERE/deliverables"
FPS=30

# 15 MB is the hard cap; 3.7 Mbit/s leaves headroom for the container and for
# the WebM pass, and still clears it comfortably on this content.
MP4_KBPS=3700
WEBM_KBPS=3400

mkdir -p "$OUT"

encode() {
  local aspect="$1"
  local dir="$FRAMES/$aspect"

  if [ ! -d "$dir" ]; then
    echo "!! no frames for $aspect (expected $dir) — run render.mjs first" >&2
    return 1
  fi

  local n
  n=$(find "$dir" -name 'f*.jpg' | wc -l | tr -d ' ')
  if [ "$n" -ne 750 ]; then
    echo "!! $aspect has $n frames, expected 750 — refusing to encode a short film" >&2
    return 1
  fi

  local base="$OUT/mirage_25s_${aspect}"

  echo "==> $aspect: $n frames -> mp4 + webm + poster"

  # --- H.264 MP4, silent, two-pass for a predictable size ------------------
  # The frame sequence is full-range JPEG, which ffmpeg would otherwise pass
  # through as the deprecated yuvj420p. Browsers and QuickTime are happier with
  # limited-range yuv420p tagged bt709, so the range is converted explicitly
  # rather than left to the demuxer.
  local X264="libx264 -preset slow -b:v ${MP4_KBPS}k -pix_fmt yuv420p -profile:v high -level 4.1"
  local RANGE="-color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709"
  local GOP="-x264-params keyint=60:min-keyint=30"

  # shellcheck disable=SC2086
  ffmpeg -y -loglevel error -framerate "$FPS" -i "$dir/f%04d.jpg" \
    -pass 1 -an -c:v $X264 $RANGE $GOP -f mp4 /dev/null

  # shellcheck disable=SC2086
  ffmpeg -y -loglevel error -framerate "$FPS" -i "$dir/f%04d.jpg" \
    -pass 2 -an -c:v $X264 $RANGE $GOP -movflags +faststart "$base.mp4"

  # --- VP9 WebM -----------------------------------------------------------
  ffmpeg -y -loglevel error -framerate "$FPS" -i "$dir/f%04d.jpg" \
    -an -c:v libvpx-vp9 -crf 32 -b:v "${WEBM_KBPS}k" -row-mt 1 \
    -deadline good -cpu-used 2 -pix_fmt yuv420p "$base.webm"

  # --- Poster from the opening frame --------------------------------------
  ffmpeg -y -loglevel error -i "${dir}/f0000.jpg" -q:v 2 "$base-poster.jpg"

  # --- Verify --------------------------------------------------------------
  local bytes dur frames
  bytes=$(stat -f%z "$base.mp4")
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$base.mp4")
  frames=$(ffprobe -v error -count_frames -select_streams v:0 \
    -show_entries stream=nb_read_frames -of csv=p=0 "$base.mp4" | cut -d, -f1)

  printf '    %-34s %6.2f MB  %ss  %s frames\n' "$(basename "$base").mp4" \
    "$(echo "$bytes" | awk '{printf "%.2f", $1/1048576}')" "$dur" "$frames"

  if [ "$frames" != "750" ]; then
    echo "!! $aspect mp4 has $frames frames, expected 750" >&2
    return 1
  fi
  if [ "$bytes" -ge $((15 * 1024 * 1024)) ]; then
    echo "!! $aspect mp4 is $(echo "$bytes" | awk '{printf "%.2f", $1/1048576}') MB, over the 15 MB cap" >&2
    return 1
  fi
}

for aspect in "$@"; do
  encode "$aspect"
done

if [ "$#" -eq 0 ]; then
  encode landscape
  encode portrait
fi

echo
echo "deliverables in $OUT"
ls -lh "$OUT" | tail -n +2 | awk '{printf "  %-40s %s\n", $9, $5}'
