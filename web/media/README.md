# Tour media

Videos referenced by `src/data/tour.ts` (`video:` field) are served from this
folder at `https://<user>.github.io/mobilemurdertour/media/<file>`.

Expected files (add them as you produce them — the app hides the player
gracefully if a file is missing, it just shows a loading frame):

| File | Stop |
| --- | --- |
| `intro.mp4` | The Avenue, 1885 |
| `mollie-smith.mp4` | Mollie Smith site |
| `eliza-shelley.mp4` | Eliza Shelley site |
| `mary-ramey.mp4` | Mary Ramey site |
| `susan-hancock.mp4` | Susan Hancock site |
| `eula-phillips.mp4` | Eula Phillips site |
| `moonlight-tower.mp4` | Moonlight tower epilogue |

## Encoding guidance (free tools)

GitHub blocks files over 100 MB and Pages soft-caps the site at ~1 GB, so keep
each clip small. 720p H.264 at ~1.5 Mbps is ideal for street viewing:

```
ffmpeg -i input.mov -vf scale=-2:720 -c:v libx264 -b:v 1500k -preset slow \
       -c:a aac -b:a 96k -movflags +faststart mollie-smith.mp4
```

`-movflags +faststart` matters: it lets the video start streaming before the
whole file downloads.
