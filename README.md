# WhatsApp Contacts Exporter

A simple tool to export WhatsApp group contacts to CSV files.

## Description

WhatsApp Contacts Exporter is a Node.js application that helps you extract contact information from WhatsApp groups. It uses the wa-automate library to interact with WhatsApp Web and provides a convenient way to export group member phone numbers to CSV files.

## Features

- Export WhatsApp group contacts to CSV files
- List all WhatsApp groups you're a member of
- Simple command-based interaction via WhatsApp
- Containerized with Docker for easy deployment

## Requirements

- Node.js (v14 or higher)
- npm or yarn
- Docker and Docker Compose (for containerized deployment)

## Installation

### Standard Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/username/whatsapp-contacts.git
   cd whatsapp-contacts
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the application:
   ```bash
   npm start
   ```

### Docker Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/username/whatsapp-contacts.git
   cd whatsapp-contacts
   ```

2. Build and run with Docker Compose:
   ```bash
   docker compose up -d
   ```

## Usage

1. Start the application
2. Scan the QR code with your WhatsApp to log in
3. Send `Hi SMS X!` or `#help` to the bot to get started
4. Use the following commands:
   - `#command` - List all available commands
   - `#groups` - List all groups you share with the bot
   - `#group-<id>` - Get the members list of a specific group (e.g., `#group-1234`)

## Bot Commands

- `Hi SMS X!` - Get a welcome message and introduction
- `#help` - Get help with available commands
- `#command` - List all available commands
- `#groups` - Get a list of groups you share with the bot
- `#group-<id>` - Export a specific group's contacts to CSV

## Docker Deployment

The application can be easily deployed using Docker. The included `Dockerfile` and `compose.yaml` files set up all necessary dependencies and configurations.

```bash
docker compose up -d
```

This will start the container in detached mode. The WhatsApp session data is persisted in a Docker volume.

## Dependencies

- [@open-wa/wa-automate](https://github.com/open-wa/wa-automate-nodejs) - WhatsApp Web automation
- [csv-writer-portable](https://github.com/ryu1kn/csv-writer) - CSV file generation
- [lodash](https://lodash.com/) - Utility functions
- [md5](https://github.com/pvorb/node-md5) - MD5 hashing
- [ondeath](https://github.com/zoubin/ondeath) - Process cleanup on exit
- [sanitize-filename](https://github.com/parshap/node-sanitize-filename) - Filename sanitization

## License

ISC

## Author

Richard Muvirimi <richard@tyganeutronics.com>