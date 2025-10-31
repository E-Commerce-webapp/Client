# E-Commerce Web Application

## Overview
This project is a modern **E-Commerce Web Application** where users can browse products, add them to the shopping cart, and make purchases.  
It is designed with a **microservice architecture** to ensure scalability, modularity, and easy maintenance.

The goal of this project is to learn and apply **Kotlin Spring Boot**, **Docker**, **Kubernetes**, and **React.js** to build a full-stack web application.

---

## Key Features
- User registration and login (JWT authentication)
- Browse and search products
- Shopping cart and order management
- Secure payment integration (future plan)
- Admin panel for managing products and orders
- Email notification service

---

## Architecture
The backend follows a **microservices architecture**, where each service handles a specific part of the system.

### Backend Microservices
- **Auth Service** – Handles user authentication and authorization.
- **Product Service** – Manages products, categories, and inventory.
- **Order Service** – Handles shopping carts and orders.
- **Notification Service** – Sends confirmation emails or alerts.
- **Gateway Service** – Central entry point for API routing.
- **Config Server** – Manages configuration for all microservices.
- **Discovery Server (Eureka)** – Registers and locates services dynamically.

---

## Tools and Technologies

### Backend
- **Language:** Kotlin  
- **Framework:** Spring Boot  
- **Database:** FireStore
- **Authentication:** JWT, Firebase Auth
- **Service Discovery:** Spring Cloud Netflix Eureka  
- **API Gateway:** Spring Cloud Gateway  
- **Configuration Management:** Spring Cloud Config  
- **Build Tool:** Gradle  

### Frontend
- **Framework:** React.js  
- **Styling:** CSS  
- **HTTP Client:** Axios  

### DevOps & Deployment
- **Containerization:** Docker  
- **Orchestration:** Kubernetes  
- **Version Control:** Git & GitHub  
- **Kanban Board:** GitHub Projects
- **Deployment** AWS

---

## Goals
- Learn to design and implement a **microservice-based backend** using **Kotlin + Spring Boot**.  
- Practice deploying a full-stack application using **Docker and Kubernetes**.  
- Build a **real-world e-commerce system** to demonstrate software development skills.  

---

