defmodule MyApp.ViewModel do
  import ExScript.Await

  def init, do: %{
    wizards: []
  }

  def on_add_wizard(model) do
    rand = JS.embed "Math.random()"
    model = Map.merge model, %{wizards: model.wizards ++ %{name: "Harry #{rand}"}}
    MyApp.Controller.emit :render, model
    model
  end

  def on_init(model) do
    mod = Griffin.ViewModel.Client
    res = await mod.gql! "http://localhost:4001/api", "{ wizards { name } }"
    model = Map.merge model, %{wizards: res.data.wizards}
    MyApp.Controller.emit :render, model
    model
  end
end
