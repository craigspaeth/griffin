defmodule ExampleClientApp do
  def start do
    MyApp.ViewModel.init() |> MyApp.ViewModel.load_index fn (model) ->
      Griffin.View.Client.render(MyApp.View, model)
      JS.embed "console.log('rendered client-side with', model)"
    end
  end
end
