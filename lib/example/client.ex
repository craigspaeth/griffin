defmodule ExampleClientApp do
  import ExScript.Universal

  def start do
    # Wire controller events
    for {event, fun} <- MyApp.Controller.events() do
      MyApp.Controller.on(event, fn ->
        fun.(MyApp.ViewModel.init())
      end)
    end

    # TOOD: ExScript bug wrapping the above in an expression
    foo = nil

    # Wire view rendering
    MyApp.Controller.on(:render, fn model ->
      Griffin.View.Client.render(MyApp.View, model)
    end)

    # TOOD: ExScript bug wrapping the above in an expression
    foo = nil

    # Init
    MyApp.Controller.emit(:render, MyApp.ViewModel.init())

    # TOOD: ExScript bug wrapping the above in an expression
    foo = nil

    MyApp.Controller.emit(:init, nil)
  end
end
