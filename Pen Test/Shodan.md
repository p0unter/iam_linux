```
- - - - - - - - - - - - - - - - - - - - -
Website: shodan.io
- - - - - - - - - - - - - - - - - - - - -
Examples:
port:3389 - RDP
"webcamxp 5" port:8080
ssl:"xerox generic root"

RDP Connect (rdesktop Using):
rdesktop -k en 192.168.1.1

CLI Using:

    shodan init [APIkey]
    shodan search "device:webcam" "port:80"
    shodan search --fields ip_str,port,org "device:webcam"
    
General:

    all
    asn
    city
    country
    cpe
    device
    geo
    has_ipv6
    has_screenshot
    has_ssl
    has_vuln
    hash
    hostname
    ip
    isp
    link
    net
    org
    os
    port
    postal
    product
    region
    scan
    shodan.module
    state
    version

Screenshots:

    screenshot.hash
    screenshot.label

Cloud:

    cloud.provider
    cloud.region
    cloud.service

HTTP:

    http.component
    http.component_category
    http.favicon.hash
    http.headers_hash
    http.html
    http.html_hash
    http.robots_hash
    http.securitytxt
    http.status
    http.title
    http.waf

Bitcoin:

    bitcoin.ip
    bitcoin.ip_count
    bitcoin.port
    bitcoin.version

Restricted:

    tag
    vuln

SNMP:

    snmp.contact
    snmp.location
    snmp.name

SSL:

    ssl
    ssl.alpn
    ssl.cert.alg
    ssl.cert.expired
    ssl.cert.extension
    ssl.cert.fingerprint
    ssl.cert.issuer.cn
    ssl.cert.pubkey.bits
    ssl.cert.pubkey.type
    ssl.cert.serial
    ssl.cert.subject.cn
    ssl.chain_count
    ssl.cipher.bits
    ssl.cipher.name
    ssl.cipher.version
    ssl.ja3s
    ssl.jarm
    ssl.version

NTP:

    ntp.ip
    ntp.ip_count
    ntp.more
    ntp.port

Telnet:

    telnet.do
    telnet.dont
    telnet.option
    telnet.will
    telnet.wont

SSH:

    ssh.hassh
    ssh.type
```