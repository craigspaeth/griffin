defmodule ExampleClientApp do
  import ExScript.Await

  def start do
    data = await MyApp.ViewModel.init()
    |> MyApp.ViewModel.load_index()
    model = data.data
    Griffin.View.Client.render(MyApp.View, model)
    JS.embed "console.log('rendered client-side with', model)"
  end
end
