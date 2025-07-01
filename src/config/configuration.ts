export default () => ({
  port: parseInt(process.env.PORT, 10) || 3015,
  database: {
    uri: process.env.MONGODB_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  api: {
    url: process.env.API_URL || 'http://localhost:3015',
  },
  sunat: {
    clientId: process.env.ID_SUNAT,
    clientSecret: process.env.KEY_SUNAT,
    rucEmpresa: process.env.RUC_EMPRESA,
  },
})
