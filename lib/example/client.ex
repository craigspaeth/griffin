defmodule ExampleClientApp do
  import ExScript.Universal

  def start do
    # Set up persistent state map that updates on set event, TODO: Use Elixir abstraction like Agent?
    state = MyApp.ViewModel.model()

    Griffin.Controller.on(:set, fn new_state ->
      JS.embed("state = new_state")
    end)

    # Wire controller events
    for {event, fun} <- MyApp.Controller.events() do
      Griffin.Controller.on(event, fn args ->
        fun.(MyApp.ViewModel.model(state), args)
      end)
    end

    # Wire view rendering
    Griffin.Controller.on(:render, fn model ->
      Griffin.View.Client.render(MyApp.View, model)
    end)

    # Init
    Griffin.Controller.emit(:render, MyApp.ViewModel.model())
    Griffin.Controller.emit(:init, nil)
  end
end
