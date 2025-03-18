import { useCallback } from "react"
import useSWR from "swr"

async function fetchStatus() {
  const response = await fetch("/api/v1/status")
  const responseBody = await response.json()
  return responseBody
}

export default function StatusPage() {
  const { isLoading, data } = useSWR("status", fetchStatus, {
    refreshInterval: 10000,
  })

  const getConectionsColor = useCallback(() => {
    const { dependencies } = data

    const percentage =
      (dependencies.database.pg_used_connections /
        dependencies.database.pg_max_connections) *
      100

    if (percentage >= 80) {
      return "is-danger"
    }

    if (percentage >= 50) {
      return "is-warning"
    }

    return "is-success"
  }, [data])

  const renderContent = useCallback(() => {
    if (isLoading) {
      return (
        <div className="skeleton-lines mt-5">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      )
    }

    return (
      <>
        <h2 className="has-text-weight-bold	">Ultima atualização</h2>
        <p>{new Date(data.updated_at).toLocaleString("pt-BR")}</p>
        <br />

        <h2 className="has-text-weight-bold	">Condição</h2>
        <p
          className={`has-text-${data.status === "Healthy" ? "success" : "danger"}`}
        >
          {data.status}
        </p>
        <br />

        <h2 className="has-text-weight-bold	">Conexões com o banco</h2>
        <progress
          class={`progress ${getConectionsColor()}`}
          value={data.dependencies.database.pg_used_connections}
          max={data.dependencies.database.pg_max_connections}
        />
      </>
    )
  }, [data, getConectionsColor, isLoading])

  return (
    <div className="container py-5 px-5">
      <h1 className="title">Status do sistema</h1>
      {renderContent()}
    </div>
  )
}
