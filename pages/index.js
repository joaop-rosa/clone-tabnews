import "bulma/css/bulma.css"

export default function Home() {
  return (
    <div className="container py-5 px-5">
      <div className="is-flex is-flex-direction-column is-justify-content-center is-align-items-center has-text-centered py-5">
        <h1 className="title">Em construção</h1>
        <p class="subtitle">Em breve um novo pedaço da internet aqui :)</p>
      </div>

      <div className="skeleton-lines mt-5">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  )
}
