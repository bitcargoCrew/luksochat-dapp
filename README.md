## Getting Started

Install the dependencies and run the development server

```bash
npm install
npm run dev
# or
yarn
yarn dev
```

```
docker build -t luksochat .

docker run -d \
    -p 3001:3000 \
    --name luksochat \
    -v $(pwd)/public:/todo/public \
    -v $(pwd)/src:/todo/src \
    luksochat
```