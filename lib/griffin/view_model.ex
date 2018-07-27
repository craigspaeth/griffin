defmodule Griffin.ViewModel do
  def update(state) do
    if ExScript.Universal.env?(:browser) do
      Griffin.Controller.emit(:view_model_update, state)
    end

    state
  end
end
