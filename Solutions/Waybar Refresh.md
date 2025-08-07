It's just for waybar of hyprland config :
```bash
killall -SIGUSR2 waybar
```

Bash script for all time listening changes:
```bash
#!/bin/bash

CONFIG_LOC="/home/user/.config/waybar/config"

trap "killall waybar" EXIT

while true; do
  waybar & 
  inotifywait -e create,modify $CONFIG_LOC
  killall waybar
done
```
[Details (Reddit Comment)](https://www.reddit.com/r/hyprland/comments/136gptg/comment/mqpj5sd/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button)
