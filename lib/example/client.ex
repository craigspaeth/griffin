defmodule ClientView do
  def render(model) do
    [:h1, "Hello World"]
  end
end

defmodule ExampleClientApp do
  def start do
    IO.puts Enum.at ClientView.render(), 1
  end
end