# Cognivia: AI & OCR Based Mobile Application for Dementia Sufferers

Cognivia adalah aplikasi mobile berbasis AI yang dirancang untuk membantu penderita demensia dan caregiver dalam aktivitas sehari-hari. Menggunakan teknologi seperti speech recognition, text recognition, dan real-time location tracking, Cognivia menghadirkan solusi yang interaktif, responsif, dan manusiawi.

---
## Arsitektur Sistem

![Architecture Diagram](https://github.com/user-attachments/assets/92fa1da4-998f-4db5-a64e-8548e229f570)

---

## Teknologi Utama

### Frontend

- React Native  
- Typescript  
- Tailwind CSS (via NativeWind)  
- Expo (untuk pengembangan & deployment)

### Backend & Services

- Supabase (Database & Authentication)  
- AWS S3 (Penyimpanan file)  
- Python (untuk microservice Telegram bot)  
  Repository: [cognivia-telegram-bot](https://github.com/valuin/cognivia-telegram-bot)

### AI & ML

- Gemini 2.0 Flash API (speech recognition, context generation)  
- ElevenLabs (text-to-speech)  
- React Native ML Kit (text recognition)

### Maps & Location

- Google Maps API (live tracking lokasi pengguna)

---

## Microservices

### Telegram Bot Microservice

Microservice berbasis Python yang berfungsi untuk menghubungkan caregiver dan pasien melalui Telegram.  
Repositori: [valuin/cognivia-telegram-bot](https://github.com/valuin/cognivia-telegram-bot)

---

## Fitur Utama

| Fitur         | Deskripsi                                                                 |
|---------------|---------------------------------------------------------------------------|
| Recall Memory | Menggunakan speech recognition dan text-to-speech untuk mengingatkan pengguna |
| Guess Me      | Fitur pengenalan wajah menggunakan ML Kit untuk mengenali kerabat        |
| Clock Test    | Tes kognitif sederhana antara pasien dan caregiver                       |
| Agentic AI    | Pengiriman media melalui Telegram                                        |
| Safe Zone     | Pemantauan lokasi pasien secara real-time menggunakan Google Maps API    |

---


## Tim Pengembang - Counter Avenue

1. Mohammad Hervin Abydzar Hakim
2. Valtrizt Khalifah Warri
3. Tegar Fadillah  
4. Muhammad Raya Ar Rizki  
5. Ramadhika Darmaputra  

