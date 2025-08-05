#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netinet/tcp.h>
#include <arpa/inet.h>
#include <sys/time.h>
#include <sched.h>
#include <errno.h>

#define DURATION 10 
#define PACKET_SIZE 1
#define BUFFER_SIZE 8192

int main(int argc, char *argv[]) {
    if (argc != 3) {
        fprintf(stderr, "Usage: %s <TARGET_IP> <TARGET_PORT>\n", argv[0]);
        exit(EXIT_FAILURE);
    }

    int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock < 0) {
        perror("Socket error");
        exit(EXIT_FAILURE);
    }

    int yes = 1;
    if (setsockopt(sock, IPPROTO_TCP, TCP_NODELAY, &yes, sizeof(yes)) < 0) {
        perror("TCP_NODELAY error");
        close(sock);
        exit(EXIT_FAILURE);
    }

    struct sockaddr_in server_addr;
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(atoi(argv[2]));
    
    if (inet_pton(AF_INET, argv[1], &server_addr.sin_addr) <= 0) {
        perror("IP conversion error");
        close(sock);
        exit(EXIT_FAILURE);
    }

    if (connect(sock, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        perror("Connection error");
        close(sock);
        exit(EXIT_FAILURE);
    }

    cpu_set_t cpuset;
    CPU_ZERO(&cpuset);
    CPU_SET(0, &cpuset);
    if (sched_setaffinity(0, sizeof(cpuset), &cpuset) == -1) {
        perror("CPU affinity setting error");
        close(sock);
        exit(EXIT_FAILURE);
    }

    struct timeval start, end;
    long total_packets = 0;
    char buffer[BUFFER_SIZE];
    memset(buffer, 'x', sizeof(buffer));

    gettimeofday(&start, NULL);
    long elapsed_us = 0;
    
    while (elapsed_us < DURATION * 1000000) {
        ssize_t sent = send(sock, buffer, PACKET_SIZE, 0);
        if (sent <= 0) {
            perror("Send error");
            break;
        }
        total_packets++;

        if (total_packets % 10000 == 0) {
            gettimeofday(&end, NULL);
            elapsed_us = (end.tv_sec - start.tv_sec) * 1000000 + 
                         (end.tv_usec - start.tv_usec);
        }
    }

    gettimeofday(&end, NULL);
    elapsed_us = (end.tv_sec - start.tv_sec) * 1000000 + 
                 (end.tv_usec - start.tv_usec);
    double elapsed_sec = elapsed_us / 1000000.0;

    printf("Test completed!\n");
    printf("Total packets sent: %ld\n", total_packets);
    printf("Total time: %.2f seconds\n", elapsed_sec);
    printf("Packets per second (PPS): %.2f\n", total_packets / elapsed_sec);
    printf("Bandwidth: %.2f Mbps\n", 
        (total_packets * PACKET_SIZE * 8) / (elapsed_sec * 1000000));

    close(sock);
    return 0;
}
