# Container image that runs your code
FROM mcr.microsoft.com/playwright:v1.30.0-focal

WORKDIR /home/app

# Copies your code file from your action repository to the filesystem path `/` of the container
ADD *.html /home/app/
ADD *.json /home/app/
ADD *.ts /home/app/
ADD tests /home/app/tests
ADD src /home/app/src

RUN npm install
RUN npx playwright install --with-deps

RUN mkdir /home/app/dist
RUN npm run build

# Code file to execute when the docker container starts up (`entrypoint.sh`)
CMD ["npm", "run", "test"]
