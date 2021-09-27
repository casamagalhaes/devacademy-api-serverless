# Api Serverless

# Package

```shell
aws cloudformation package --template-file template.yaml --output-template-file packaged.yaml --s3-bucket cm-training-deploy
```

## Create Database

```shell
DATABASE=db.sqlite npm run db:create
```

## Run

```shell
DATABASE=db.sqlite npm start
```
