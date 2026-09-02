export default function splitPostgresConnectionString(connectionString) {
  let cleanString = connectionString.replace('postgres://', '');
  cleanString = cleanString.replace('mssql://', '');

  // Extract username and password
  const atIndex = cleanString.lastIndexOf('@');
  const userInfo = cleanString.substring(0, atIndex);
  const lastColonIndex = userInfo.lastIndexOf(':');
  const username = userInfo.substring(0, lastColonIndex);
  const password = userInfo.substring(lastColonIndex + 1);

  // Extract host, port, and database name
  const hostPortDb = cleanString.substring(atIndex + 1);
  const hostPortDbSplit = hostPortDb.split('/');
  const hostPort = hostPortDbSplit[0];
  const databaseName = hostPortDbSplit[1];

  const hostPortSplit = hostPort.split(':');
  const host = hostPortSplit[0];
  const port = hostPortSplit[1];

  return {
    username: username,
    password: password,
    host: host,
    port: port,
    database: databaseName,
  };
}
