# gohttp


## Project setup

1. Clone the repository
```bash
git clone https://github.com/adistrim/gohttp
cd gohttp
```

2. Setting up mysql database
```bash
mysql -u your_username -p your_database_name < backup.sql
```

3. Create a `.env` file in the src and frontend directory of the project and add the following

`src/.env`
```bash
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=your_database_name
SERVER_PORT=port_number
```

`frontend/.env`
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:server_port_number
```

4. Install the dependencies
```bash
cd src
go mod tidy
cd ../frontend
npm install
```

5. Run the project
```bash
./start.sh
```

6. Open your browser and navigate to `http://localhost:3000`


## License

[MIT License](LICENSE)
