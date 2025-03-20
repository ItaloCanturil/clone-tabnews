import useSWR from "swr";
import styles from "./status.module.css";

async function fetchAPI(endpoint) {
  const response = await fetch(endpoint);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <div className={styles.status_page}>
      <h1>Estatísticas e Status do Site</h1>
      <WrapperData />
    </div>
  );
}

function WrapperData() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className={styles.wrapper__data}>
      <UpdatedAt text={data.updated_at} />

      <DatabaseStatus data={data.dependencies.database} />
    </div>
  );
}

function UpdatedAt({ text }) {
  const updatedAtText = new Date(text).toLocaleString("pt-BR");
  return <div>Última atualização: {updatedAtText}</div>;
}

function DatabaseStatus({ data }) {
  return (
    <>
      <h2>Banco de Dados</h2>

      <ul>
        <li>
          Conexões disponíveis:
          <Badge text={data.max_connections} />
        </li>
        <li>
          Conexões abertas:
          <Badge text={data.opened_connections} />
        </li>
        <li>
          Versão:
          <Badge text={data.version} />
        </li>
      </ul>
    </>
  );
}

function Badge({ text }) {
  return <span className={styles.badge}>{text}</span>;
}
