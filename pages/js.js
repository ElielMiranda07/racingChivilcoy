$(".owl-carousel").owlCarousel({
  loop: true,
  margin: 10,
  responsiveClass: true,
  items: 3,
  autoplay: true,
  autoplayTimeout: 3500,
  autoplayHoverPause: true,
  smartSpeed: 1000,
  dots: false,
  responsive: {
    0: {
      items: 3,
      nav: false,
    },
    600: {
      items: 3,
      nav: false,
    },
    1000: {
      items: 3,
      nav: false,
    },
  },
});
