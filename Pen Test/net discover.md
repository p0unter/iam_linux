```
Run netdiscover: netdiscover
-r : scanning range
example: netdiscover -r 10.10.10.0/24
-f : fast
-i : interface
-l : destination file
-p : passive/silent scanning
```
```
netdiscover -r 10.10.10.0/24
netdiscover -i eth0

tshark

arp-scan 10.10.10.0/24
arp-scan -l -v -s 10.10.10.0/82
```