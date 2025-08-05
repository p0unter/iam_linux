important libs:
```bash
sudo pacman -S sof-firmware alsa-ucm-conf linux-firmware pipewire pipewire-alsa pipewire-pulse wireplumber
```
for pipewire:
```bash
sudo pacman -S pipewire pipewire-pulse wireplumber lib32-pipewire
```
learn current audio card stat
```bash
aplay -l
lspci | grep -i audio
```
open grub conf file: 
```bash
sudo nano /etc/default/grub
```
add this content in ``GRUB_CMDLINE_LINUX``:
```
snd-intel-dspcfg.dsp_driver=1
```
then refresh grub conf:
```bash
sudo grub-mkconfig -o /boot/grub/grub.cfg
```
