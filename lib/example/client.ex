defmodule ClientView do
  def styles do
    [
      ul: [
        list_style: "none"
      ],
      item: [
        font_size: "16px",
        font_family: "Helvetica"
      ]
    ]
  end

  def render(model) do
    [
      :ul,
      if length(model.wizards) > 0 do
        for wizard <- model.wizards do
          [:li@item, "Welcome #{wizard.name}"]
        end
      else
        [:h1, "No wizards"]
      end
    ]
  end
end

defmodule ExampleClientApp do
  def start do
    model = %{wizards: [%{name: "Harry Potter"}]}
    Griffin.View.Client.render(ClientView, model)
  end
end
