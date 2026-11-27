/*!========================================================================
 *  hexo-theme-snippet: app.js v1.0.0
 * ======================================================================== */
(function initApp() {
  var $body = document.body,
    $mnav = document.getElementById("mnav"), //获取导航三角图标
    $mainMenu = document.getElementById("main-menu"), //手机导航
    $process = document.getElementById("process"), //进度条
    $ajaxImgs = document.querySelectorAll(".img-ajax"), //图片懒加载
    $commentsCounter = document.getElementById("comments-count"),
    $gitcomment = document.getElementById("gitcomment"),
    $backToTop = document.getElementById("back-to-top"),
    $toc = document.getElementById("article-toc"),
    timer = null;

  //设备判断
  var isPC = true;
  (function (designPercent) {
    function params(u, p) {
      var m = new RegExp("(?:&|/?)" + p + "=([^&$]+)").exec(u);
      return m ? m[1] : "";
    }
    if (
      /iphone|ios|android|ipod/i.test(navigator.userAgent.toLowerCase()) ==
        true &&
      params(location.search, "from") != "mobile"
    ) {
      isPC = false;
    }
  })();

  //文章目录：默认展开两层，子目录可手动展开或收起
  function initToc() {
    if (!$toc) return;

    var $tocList = $toc.querySelector(".toc");
    var defaultExpandedDepth = 2;
    var childListId = 0;
    if (!$tocList) return;

    function getChildList($item) {
      for (
        var $child = $item.firstElementChild;
        $child;
        $child = $child.nextElementSibling
      ) {
        if (
          $child.tagName.toLowerCase() === "ol" &&
          $child.classList.contains("toc-child")
        ) {
          return $child;
        }
      }
      return null;
    }

    function setExpanded($item, $button, $childList, isExpanded) {
      var label = isExpanded ? "收起子目录" : "展开子目录";
      $item.classList.toggle("is-expanded", isExpanded);
      $item.classList.toggle("is-collapsed", !isExpanded);
      $button.setAttribute("aria-expanded", isExpanded ? "true" : "false");
      $button.setAttribute("aria-label", label);
      $button.setAttribute("title", label);
      $childList.hidden = !isExpanded;
    }

    function setupList($list, depth) {
      for (
        var $item = $list.firstElementChild;
        $item;
        $item = $item.nextElementSibling
      ) {
        var $childList = getChildList($item);
        if (!$childList) continue;

        var $button = document.createElement("button");
        $button.setAttribute("type", "button");
        $button.setAttribute("class", "toc-toggle");
        $childList.id =
          $childList.id || "article-toc-children-" + ++childListId;
        $button.setAttribute("aria-controls", $childList.id);
        $item.insertBefore($button, $item.firstChild);
        setExpanded($item, $button, $childList, depth < defaultExpandedDepth);

        (function ($currentItem, $currentButton, $currentChildList) {
          $currentButton.onclick = function () {
            setExpanded(
              $currentItem,
              $currentButton,
              $currentChildList,
              $currentButton.getAttribute("aria-expanded") !== "true"
            );
          };
        })($item, $button, $childList);

        setupList($childList, depth + 1);
      }
    }

    setupList($tocList, 1);
  }
  initToc();

  //手机菜单导航
  $mnav.onclick = function () {
    var navOpen = $mainMenu.getAttribute("class");
    if (navOpen.indexOf("in") != "-1") {
      $mainMenu.setAttribute("class", "collapse navbar-collapse");
    } else {
      $mainMenu.setAttribute("class", "collapse navbar-collapse in");
    }
  };

  //首页文章图片懒加载
  function imgsAjax($targetEles) {
    if (!$targetEles) return;
    var _length = $targetEles.length;
    if (_length > 0) {
      var scrollBottom = getScrollTop() + window.innerHeight;
      for (var i = 0; i < _length; i++) {
        (function (index) {
          var $this = $targetEles[index];
          var $this_offsetZero =
            $this.getBoundingClientRect().top +
            window.pageYOffset -
            document.documentElement.clientTop;
          if (
            scrollBottom >= $this_offsetZero &&
            $this.getAttribute("data-src") &&
            $this.getAttribute("data-src").length > 0
          ) {
            if ($this.nodeName.toLowerCase() === "img") {
              $this.src = $this.getAttribute("data-src");
              $this.style.display = "block";
            } else {
              var imgObj = new Image();
              imgObj.onload = function () {
                $this.innerHTML = "";
              };
              imgObj.src = $this.getAttribute("data-src");
              $this.style.backgroundImage =
                "url(" + $this.getAttribute("data-src") + ")";
            }
            $this.removeAttribute("data-src"); //为了优化，移除
          }
        })(i);
      }
    }
  }

  //获取滚动高度
  function getScrollTop() {
    return $body.scrollTop || document.documentElement.scrollTop;
  }
  //滚动回调
  var scrollCallback = function () {
    if ($process) {
      $process.style.width =
        (getScrollTop() / ($body.scrollHeight - window.innerHeight)) * 100 +
        "%";
    }
    isPC && getScrollTop() >= 300
      ? $backToTop.removeAttribute("class", "hide")
      : $backToTop.setAttribute("class", "hide");
    imgsAjax($ajaxImgs);
  };
  scrollCallback();

  //监听滚动事件
  window.addEventListener("scroll", function () {
    if ($toc) {
      var top = $toc.offsetTop;
      var left = $toc.offsetLeft;
      var width = $toc.offsetWidth;
      if (getScrollTop() <= top) {
        $toc.style = "";
      } else {
        $toc.style.position = "fixed";
        $toc.style.top = "5px";
        $toc.style.left = left + "px";
        $toc.style.width = width + "px";
      }
    }
    clearTimeout(timer);
    timer = setTimeout(function fn() {
      scrollCallback();
    }, 200);
  });

  //返回顶部
  $backToTop.onclick = function () {
    cancelAnimationFrame(timer);
    timer = requestAnimationFrame(function fn() {
      var sTop = getScrollTop();
      if (sTop > 0) {
        $body.scrollTop = document.documentElement.scrollTop = sTop - 500;
        timer = requestAnimationFrame(fn);
      } else {
        cancelAnimationFrame(timer);
      }
    });
  };
})();
