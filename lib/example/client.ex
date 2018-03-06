defmodule ExampleClientApp do
  import ExScript.Await

  def start do
    # Wire controller events
    for {event, fun} <- MyApp.Controller.events do
      MyApp.Controller.on(event, fn ->
        fun.(MyApp.ViewModel.init())
      end)
    end

    foo = nil # TOOD: ExScript bug wrapping the above in an expression

    # Wire view rendering
    MyApp.Controller.on(:render, fn (model) ->
      Griffin.View.Client.render(MyApp.View, model)
    end)

    foo = nil # TOOD: ExScript bug wrapping the above in an expression

    # Init
    MyApp.Controller.emit(:render, MyApp.ViewModel.init())

    foo = nil # TOOD: ExScript bug wrapping the above in an expression

    MyApp.Controller.emit(:init, nil)
  end
end
