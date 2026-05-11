#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <sstream>
#include <winsock2.h>
#include <ws2tcpip.h>
#include <random>
#include <chrono>
#include <iomanip>

#pragma comment(lib, "Ws2_32.lib")

#define PORT "8080"
#define DEFAULT_BUFLEN 4096

std::string generate_order_id() {
    static const char alphabet[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    std::string id = "ORD-";
    std::random_device rd;
    std::mt19932 equipment(rd());
    std::uniform_int_distribution<int> dist(0, sizeof(alphabet) - 2);
    
    for (int i = 0; i < 8; ++i) {
        id += alphabet[dist(equipment)];
    }
    return id;
}

std::string get_current_time_str() {
    auto now = std::chrono::system_clock::now();
    auto in_time_t = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::localtime(&in_time_t), "%Y-%m-%d %X");
    return ss.str();
}

void handle_client(SOCKET ClientSocket) {
    char recvbuf[DEFAULT_BUFLEN];
    int recvbuflen = DEFAULT_BUFLEN;
    
    int iResult = recv(ClientSocket, recvbuf, recvbuflen, 0);
    if (iResult > 0) {
        std::string request(recvbuf, iResult);
        std::cout << "Received request: " << request.substr(0, request.find("\n")) << std::endl;

        // Parse requested path and method
        std::string method = "";
        std::string path = "/";
        
        size_t pos = request.find(" ");
        if (pos != std::string::npos) {
            method = request.substr(0, pos);
            size_t start = pos + 1;
            size_t end = request.find(" ", start);
            if (end != std::string::npos) {
                path = request.substr(start, end - start);
            }
        }

        std::string response;

        // Handle API Order Endpoint
        if (method == "POST" && path == "/api/order") {
            size_t body_pos = request.find("\r\n\r\n");
            std::string body = "";
            if (body_pos != std::string::npos) {
                body = request.substr(body_pos + 4);
            }
            
            std::cout << "Order Body: " << body << std::endl;
            
            std::string order_id = generate_order_id();
            std::string json_response = "{\"success\":true,\"message\":\"Order placed successfully\",\"orderId\":\"" + order_id + "\"}";
            
            response = "HTTP/1.1 200 OK\r\n";
            response += "Content-Type: application/json\r\n";
            response += "Content-Length: " + std::to_string(json_response.length()) + "\r\n";
            response += "Connection: close\r\n\r\n";
            response += json_response;
            
            send(ClientSocket, response.c_str(), response.length(), 0);
            closesocket(ClientSocket);
            return;
        }

        // Handle API Login Endpoint
        if (method == "POST" && path == "/api/login") {
            size_t body_pos = request.find("\r\n\r\n");
            std::string body = "";
            if (body_pos != std::string::npos) {
                body = request.substr(body_pos + 4);
            }
            
            std::cout << "Login Body: " << body << std::endl;
            
            // Store in file
            std::ofstream file("users.txt", std::ios::app);
            if (file.is_open()) {
                file << get_current_time_str() << " | " << body << std::endl;
                file.close();
            } else {
                std::cerr << "Failed to open users.txt for writing" << std::endl;
            }
            
            std::string json_response = "{\"success\":true,\"message\":\"Login successful\"}";
            
            response = "HTTP/1.1 200 OK\r\n";
            response += "Content-Type: application/json\r\n";
            response += "Content-Length: " + std::to_string(json_response.length()) + "\r\n";
            response += "Connection: close\r\n\r\n";
            response += json_response;
            
            send(ClientSocket, response.c_str(), response.length(), 0);
            closesocket(ClientSocket);
            return;
        }

        // Serve Static Files
        std::string content_type = "text/html";
        std::string filename = "login.html";

        if (path == "/" || path == "/login" || path == "/login.html") {
            filename = "login.html";
            content_type = "text/html";
        } else if (path == "/index.html" || path == "/index") {
            filename = "index.html";
            content_type = "text/html";
        } else if (path == "/main" || path == "/main.html") {
            filename = "main.html";
            content_type = "text/html";
        } else if (path == "/style.css") {
            filename = "style.css";
            content_type = "text/css";
        } else if (path == "/script.js") {
            filename = "script.js";
            content_type = "application/javascript";
        } else if (path.find("/images/") == 0) {
            filename = path.substr(1); // remove leading slash
            if (path.find(".png") != std::string::npos) {
                content_type = "image/png";
            }
        }

        // Read file
        std::ifstream file(filename, std::ios::binary);
        if (file.is_open()) {
            std::stringstream buffer;
            buffer << file.rdbuf();
            std::string file_body = buffer.str();

            response = "HTTP/1.1 200 OK\r\n";
            response += "Content-Type: " + content_type + "\r\n";
            response += "Content-Length: " + std::to_string(file_body.length()) + "\r\n";
            response += "Connection: close\r\n\r\n";
            response += file_body;
        } else {
            // 404 Not Found
            std::string error_body = "<html><body><h1>404 Not Found</h1></body></html>";
            response = "HTTP/1.1 404 Not Found\r\n";
            response += "Content-Type: text/html\r\n";
            response += "Content-Length: " + std::to_string(error_body.length()) + "\r\n";
            response += "Connection: close\r\n\r\n";
            response += error_body;
        }

        // Send response
        send(ClientSocket, response.c_str(), response.length(), 0);
    }
    
    closesocket(ClientSocket);
}

int main() {
    WSADATA wsaData;
    int iResult;

    // Initialize Winsock
    iResult = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (iResult != 0) {
        std::cerr << "WSAStartup failed: " << iResult << std::endl;
        return 1;
    }

    struct addrinfo *result = NULL, *ptr = NULL, hints;

    ZeroMemory(&hints, sizeof(hints));
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    hints.ai_protocol = IPPROTO_TCP;
    hints.ai_flags = AI_PASSIVE;

    // Resolve the local address and port to be used by the server
    iResult = getaddrinfo(NULL, PORT, &hints, &result);
    if (iResult != 0) {
        std::cerr << "getaddrinfo failed: " << iResult << std::endl;
        WSACleanup();
        return 1;
    }

    SOCKET ListenSocket = INVALID_SOCKET;

    // Create a SOCKET for the server to listen for client connections
    ListenSocket = socket(result->ai_family, result->ai_socktype, result->ai_protocol);
    if (ListenSocket == INVALID_SOCKET) {
        std::cerr << "Error at socket(): " << WSAGetLastError() << std::endl;
        freeaddrinfo(result);
        WSACleanup();
        return 1;
    }

    // Setup the TCP listening socket
    iResult = bind(ListenSocket, result->ai_addr, (int)result->ai_addrlen);
    if (iResult == SOCKET_ERROR) {
        std::cerr << "bind failed with error: " << WSAGetLastError() << std::endl;
        freeaddrinfo(result);
        closesocket(ListenSocket);
        WSACleanup();
        return 1;
    }

    freeaddrinfo(result);

    if (listen(ListenSocket, SOMAXCONN) == SOCKET_ERROR) {
        std::cerr << "Listen failed with error: " << WSAGetLastError() << std::endl;
        closesocket(ListenSocket);
        WSACleanup();
        return 1;
    }

    std::cout << "C++ Server listening on port " << PORT << "..." << std::endl;

    while (true) {
        SOCKET ClientSocket = INVALID_SOCKET;
        ClientSocket = accept(ListenSocket, NULL, NULL);
        if (ClientSocket == INVALID_SOCKET) {
            std::cerr << "accept failed: " << WSAGetLastError() << std::endl;
            closesocket(ListenSocket);
            WSACleanup();
            return 1;
        }

        handle_client(ClientSocket);
    }

    // Cleanup
    closesocket(ListenSocket);
    WSACleanup();

    return 0;
}
