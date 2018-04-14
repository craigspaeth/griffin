defmodule MyApp.View do
  def render(model) do
    [
      :div,
      [
        :ul,
        if length(model.wizards) > 0 do
          for wizard <- model.wizards do
            [:li, "Welcome #{wizard.name}"]
          end
        else
          [:h1, "No wizards"]
        end
      ],
      [
        :button,
        [
          on_click: fn ->
            MyApp.Controller.emit(:add_wizard, nil)
          end
        ],
        "Add wizard"
      ]
    ]
  end
end
