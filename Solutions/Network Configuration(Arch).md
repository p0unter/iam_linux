Just use 👍 : 
```bash
nmtui
```
or <br>
↓

List nearby Wi-Fi networks: 
```bash
nmcli device wifi list
```
Connect to a Wi-Fi network: 
```bash
nmcli device wifi connect SSID_or_BSSID password password
```
Connect to a hidden Wi-Fi network: 
```bash
nmcli device wifi connect SSID_or_BSSID password password hidden yes
```
Connect to a Wi-Fi on the ``wlan1`` interface: 
```bash
nmcli device wifi connect SSID_or_BSSID password password ifname wlan1 profile_name
```
Disconnect an interface: 
```bash
nmcli device disconnect ifname eth0
```
Get a list of connections with their names, UUIDs, types and backing devices: 
```bash
nmcli connection show
```
Activate a connection (i.e. connect to a network with an existing profile): 
```bash
nmcli connection up name_or_uuid
```
Delete a connection: 
```bash
nmcli connection delete name_or_uuid
```
See a list of network devices and their state: 
```bash
nmcli device
```
Turn off Wi-Fi: 
```bash
nmcli radio wifi off
```

## Edit a connection
```bash
$ > nmcli connection
NAME                UUID                                  TYPE      DEVICE
Wired connection 2  e7054040-a421-3bef-965d-bb7d60b7cecf  ethernet  enp5s0
Wired connection 1  997f2782-f0fc-301d-bfba-15421a2735d8  ethernet  enp0s25
MY-HOME-WIFI-5G     92a0f7b3-2eba-49ab-a899-24d83978f308  wifi       --
```
Here you can use the first column as connection-id used later. In this example, we pick ``Wired connection 2`` as a connection-id. 
**nmcli interactive editor**...


[Arch Wiki Documention](https://wiki.archlinux.org/title/NetworkManager#nmcli_examples)
