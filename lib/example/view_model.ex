defmodule MyApp.ViewModel do
  import ExScript.Await

  def init do
    %{
      wizards: []
    }
  end

  def load_index(model) do
    mod = Griffin.ViewModel.Server || Griffin.ViewModel.Client
    await mod.gql! "http://localhost:4001/api", "{ wizards { name } }"
  end
end
