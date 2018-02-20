defmodule MyApp.ViewModel do

  def init do
    %{
      wizards: []
    }
  end

  def load_index(model, callback) do
    mod = Griffin.ViewModel.Server || Griffin.ViewModel.Client
    data = mod.gql!(
      "http://localhost:4001/api",
      "{ wizards { name } }",
      fn (data) ->
        # model = mod.set(model, wizards: data.wizards)
        callback.(data)
      end
    )
  end
end
