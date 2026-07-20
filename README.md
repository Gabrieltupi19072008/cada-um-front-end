# CadaUm — Front-end

Front-end em React (Vite) da plataforma CadaUm, uma plataforma de currículos e vagas para pessoas com TEA.

## Rodando localmente

```bash
npm install
npm run dev
```

Por padrão a aplicação espera o back-end em `http://localhost:8000`. Para apontar para outra URL, crie um
arquivo `.env` (veja `.env.example`) com a variável `VITE_API_URL`.

## Back-end

O código do back-end (FastAPI) fica em um repositório separado:
[cada-um-back-end](https://github.com/Gabrieltupi19072008/cada-um-back-end).
