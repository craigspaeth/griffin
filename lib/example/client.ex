defmodule ExampleClientApp do
  import ExScript.Universal

  def start do
    # Wire controller events
    for {event, fun} <- MyApp.Controller.events() do
      Griffin.Controller.on(event, fn args ->
        fun.(MyApp.ViewModel.model(state), args)
      end)
    end

    # Wire view model updates to re-render and persist state
    # TODO: Use Elixir abstraction like Agent?
    state = MyApp.ViewModel.model()

    Griffin.Controller.on(:view_model_update, fn new_state ->
      JS.embed("state = new_state")
      Griffin.View.Client.render(MyApp.View, MyApp.ViewModel.model(new_state))
    end)

    # Initial events
    Griffin.Controller.emit(:view_model_update, MyApp.ViewModel.model())
    Griffin.Controller.emit(:init, nil)
  end
end
