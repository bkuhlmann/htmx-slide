# frozen_string_literal: true

require "rack_helper"

RSpec.describe "Demo", :js do
  using Refinements::Pathname

  subject :app do
    Rack::Static.new proc { [200, {"Content-Type" => "text/html"}, ["<h1>Demo</h1>"]] },
                     {
                       root: app_path,
                       urls: app_path.files.map { |path| "/#{path.basename}" }
                     }
  end

  let(:app_path) { Bundler.root.join "tmp/test" }

  before do
    app_path.rmtree.mkpath
    Bundler.root.join("demo").files.each { |path| path.copy app_path }
    Bundler.root.join("lib/htmx-slide.js").copy app_path
    Capybara.app = app
  end

  it "loads demonstration" do
    visit "/index.html"
    expect(page).to have_text("Demonstration")
  end

  it "toggles fullscreen", :aggregate_failures do
    fullscreen = proc do
      page.evaluate_script "document.fullscreenElement === arguments[0]", find(".viewport")
    end

    visit "/index.html"
    click_button "[ ]"

    expect(fullscreen.call).to be(true)

    find("body").send_keys "f"

    expect(fullscreen.call).to be(false)

    find("body").send_keys "f"

    expect(fullscreen.call).to be(true)

    find("body").send_keys "f"
    click_link "Next"
    find("body").send_keys "f"

    expect(fullscreen.call).to be(true)
  end

  it "plays slideshow", :aggregate_failures do
    visit "/index.html"

    expect(page).to have_css(%(#progress[value="0"]))
    expect(page).to have_css(%(#progress[max="2"]))
    expect(page).to have_text("1 of 3")

    click_link "Next"

    expect(page).to have_css(%(#progress[value="1"]))
    expect(page).to have_text("2 of 3")

    find("body").send_keys :right

    expect(page).to have_css(%(#progress[value="2"]))
    expect(page).to have_text("3 of 3")

    click_link "Previous"

    expect(page).to have_css(%(#progress[value="1"]))
    expect(page).to have_text("2 of 3")

    find("body").send_keys :left

    expect(page).to have_css(%(#progress[value="0"]))
    expect(page).to have_text("1 of 3")

    click_link "First"

    expect(page).to have_css(%(#progress[value="0"]))
    expect(page).to have_text("1 of 3")

    click_link "Last"

    expect(page).to have_css(%(#progress[value="2"]))
    expect(page).to have_text("3 of 3")

    find("body").send_keys "["

    expect(page).to have_css(%(#progress[value="0"]))
    expect(page).to have_text("1 of 3")

    find("body").send_keys "]"

    expect(page).to have_css(%(#progress[value="2"]))
    expect(page).to have_text("3 of 3")
  end
end
