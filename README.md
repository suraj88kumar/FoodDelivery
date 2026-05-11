# GlowFood - Premium Food Delivery App

A high-fidelity food delivery application with a stunning Glassmorphism UI.

## Features
- **Glassmorphism Design**: Frosted glass effects, vibrant gradients, and modern typography.
- **Interactive Menu**: Browse foods by category and add them to your cart.
- **C++ Backend**: A simple Winsock HTTP server to serve the application (or use the Node.js fallback).

## How to Run

### Option 1: Using C++ Backend (Recommended by Request)

To compile and run the C++ server on Windows:

1. Open a terminal that has access to a C++ compiler (like Developer Command Prompt for Visual Studio or Git Bash with MinGW).
2. Compile the server:
   ```bash
   g++ server.cpp -o server.exe -lws2_32
   ```
   *Or with MSVC:*
   ```cmd
   cl server.cpp /link ws2_32.lib
   ```
3. Run the server:
   ```bash
   ./server.exe
   ```
4. Open your browser and go to `http://localhost:8080`.

### Option 2: Using Node.js Fallback (Easiest)

Since a C++ compiler was not detected in the default path, I have also provided a Node.js server for your convenience.

1. Run the Node.js server:
   ```bash
   node server.js
   ```
2. Open your browser and go to `http://localhost:8080`.

## Assets
Images were generated specifically for this project using advanced AI to ensure a premium look.
- `images/pizza.png`
- `images/burger.png`
- `images/sushi.png`
- `images/salad.png`
