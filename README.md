## Bitvia, a new way to communicate in the creative industry

Bitvia offers a new way for a creators, brands and influencers to exchange messages,
tokens and NFTs via a decentralized chat application. It is the place where the new
creative community meets.

Check it out: https://www.youtube.com/watch?v=zi9asoFRdcc

## Team

Sandro Rüttimann - sr_social@outlook.com
Roger Heines - roger.heines@gmail.com
Van Thanh Le - levanthanh3005@gmail.com

## Getting Started

### Install the dependencies and run the development server

```bash
npm install
npm run dev
# or
yarn
yarn dev
```

### Or run with Docker

Build docker image:

```bash
docker build -t luksochat .
#Run and debug:
docker run -d \
    -p 3001:3000 \
    --name luksochat \
    -v $(pwd)/public:/todo/public \
    -v $(pwd)/src:/todo/src \
    luksochat
```