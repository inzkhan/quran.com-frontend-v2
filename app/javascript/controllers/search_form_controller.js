import { Controller } from "stimulus";
import { debounce } from "lodash-es";
import DeviceDetector from "../utility/deviceDetector";

const FILTER_DELAY = 150;

export default class extends Controller {
  connect() {
    let el = this.element;

    this.searchBox = $(el).find("[name=query]");
    this.device = new DeviceDetector();

    this.searchBox
      .change(e => {
        this.getSuggestions(e.target.value);
      })
      .keyup(
        debounce(function(e) {
          /* fire the above change event after every letter is typed with a delay of 250ms */
          $(this).change();
        }, FILTER_DELAY)
      );

    this.resizeHandler();

    window.addEventListener("resize", () => this.resizeHandler());

    if (this.device.isMobile()) {
      this.element
        .querySelector("#search-trigger")
        .addEventListener("click", e => {
          e.preventDefault();
          e.stopImmediatePropagation();

          let mobile = this.device.isMobile();
          let query = this.searchBox.val();

          if (mobile && 0 == query.length) {
            el.classList.toggle("expand-collapse");
            el.classList.toggle("sb-search-open");
          }
        });
    }
  }

  resizeHandler() {
    let classes = this.element.classList;
    const expandable = this.element.dataset.expand == "true";

    if (this.device.isMobile() && expandable) {
      // collapse the search bar
      classes.remove("sb-search-open");
    } else {
      classes.add("sb-search-open");
      classes.remove("expand-collapse");
    }
  }

  getSuggestions(text) {
    if (text && text.length > 0) {
      fetch(`/search/suggestion?query=${text}`)
        .then(response => response.text())
        .then(suggestions => {
          $(".suggestions").html(suggestions);
        })
        .catch(error => callback([]));
    } else {
      $(".suggestions").empty();
    }
  }

  handleItemKeyDown(event, item) {
    const items = this.menu.getElementsByTagName("li");

    if (!items.length) {
      return;
    }

    switch (event.keyCode) {
      case 9: // tab
        return;
      case 13: // enter
        this.props.push(item.href); // change url
        break;
      case 27: // escape
        // TODO if open closeMenu()
        break;
      case 38: // up
        if (event.target === items[0]) {
          // we're on the first item, so focus the input
          this.props.input.focus();
        } else {
          event.target.previousSibling.focus();
        }
        break;
      case 40: // down
        if (event.target === items[items.length - 1]) {
          items[0].focus();
        } else {
          event.target.nextSibling.focus();
        }
        break;
      default:
        return;
    }
    event.preventDefault();
  }
}
