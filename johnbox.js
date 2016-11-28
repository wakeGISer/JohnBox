
(function ($,window,undefined) {
    //初始化命名空间,依赖JQuery
    if (!window["Freedom"]) { window["Freedom"] = {}; }
    var JohnBox = {
        //模板
        boxTemplate:
            '<div class="johnUI_box">' +
            '  <div class="johnUI_icon"></div>' +
            '  <div class="johnUI_boxReal">' +
            '	<div class="johnUI_titleBar">' +
            '	  <div class="johnUI_title">这里是标题</div>' +
            '	  <div class="johnUI_control">' +
            '		<div class="johnUI_btnMin" title="最小化"></div>' +
            '		<div class="johnUI_btnMax" title="最大化"></div>' +
            '		<div class="johnUI_btnReset" title="还原窗口"></div>' +
            '		<div class="johnUI_btnClose" title="关闭"></div>' +
            '	  </div>' +
            '	</div>' +
            '	<div class="johnUI_btnSize"></div>' +
            '	<div class="johnUI_content"></div>' +
            '	<div class="johnUI_contentCover"></div>' +
            '  </div>' +
            '</div>' +
            '<div class="johnUI_clear"></div>',
        //右侧边Box控制器模板
        rightBarTemplate:
            '<div id="johnUI_rightBoxBar" class="rightBoxBar">' +
            '   <div class="johnUI_boxHide" title="隐藏/显示"></div>' +
            '   <div class="johnUI_boxUp" title="向上滚动"></div>' +
            '   <div class="johnUI_boxDown" title="向下滚动"></div>' +
            '   <div id="johnUI_sliderBar"></div>' +
            '</div>',
        //右侧最小化窗体
        rightMinTemplate:
            '<div class="johnUI_box">' +
            '  <div class="johnUI_minBoxMin"> </div>' +
            '  <div class="johnUI_minIcon"></div>' +
            '</div>' +
            '<div class="johnUI_clear"></div>',
        //主载体
        rootLayout: "#boxContent",
        //右侧窗体控制器
        rightContrlBar: "#rightBoxBar",
        //右侧滚动条
        sliderBar: "#johnUI_sliderBar",
        //右侧窗体列表
        rightLayout: "#rightContent",
        //窗体存储列表
        boxList: {},
        //右侧边控制器展开状态
        expandState: true,     
        //层级关系
        zIndex: 10,
        //右侧窗体居下最小值
        rightMinBottom: 40,
        /*! 全局默认配置 */
        setting: {
            rootLayout: '#boxContent',
            rightLayout: '#rightContent',
            content: '<div class="ui_loading"><span>loading...</span></div>',
            title: '\u89C6\u7A97 ',     // 标题,默认'视窗'
            inRight: false,				// 显示在右侧窗体
            button: null,	     		// 自定义按钮
            ok: null,					// 确定按钮回调函数
            cancel: null,				// 取消按钮回调函数
            init: null,					// 对话框初始化后执行的函数
            close: null,				// 对话框关闭前执行的函数
            okVal: '\u786E\u5B9A',		// 确定按钮文本,默认'确定'
            cancelVal: '\u53D6\u6D88',	// 取消按钮文本,默认'取消'
            skin: '',					// 多皮肤共存预留接口
            esc: true,					// 是否支持Esc键关闭
            show: true,					// 初始化后是否显示对话框
            width: 'auto',				// 内容宽度
            height: 'auto',				// 内容高度
            icon: null,					// 消息图标名称
            path: null,                 // artdialog路径
            lock: false,				// 是否锁屏
            focus: true,                // 窗口是否自动获取焦点
            parent: null,               // 打开子窗口的父窗口对象，主要用于多层锁屏窗口
            padding: '10px',		    // 内容与边界填充距离
            fixed: false,				// 是否静止定位
            left: null,					// X轴坐标
            top: null,					// Y轴坐标
            max: true,                  // 是否显示最大化按钮
            min: true,                  // 是否显示最小化按钮
            zIndex: 1976,				// 对话框叠加高度值(重要：此值不能超过浏览器最大限制)
            resize: true,				// 是否允许用户调节尺寸
            drag: true, 				// 是否允许用户拖动位置
            cache: true,                // 是否缓存窗口内容页
            data: null,                 // 传递各种数据
            extendDrag: true,           // 增加artdialog拖拽体验
            showCompleted: null,        // 打开完成后回调
            closeCompleted: null,       // 关闭完成后回调
            sizeChanged: null            // 大小变化后回调,            
        },

        init: function () {
            JohnBox.boxList = {};
            JohnBox.expandState = true;            
        },

        //获取一个窗体
        getBox: function (config) {
            config = JohnBox._initConfig(config); //合并用户配置
            JohnBox.zIndex++;
            if (!JohnBox.boxList[config.id]) { 
                var johnBox = JohnBox.JohnBox(config);
                JohnBox.boxList[config.id] = johnBox;
            }
            return JohnBox.boxList[config.id];
        },

        getBoxById: function (id) {
            if (typeof id === 'string') {
                var boxId = id;
                return this.boxList[boxId];
            }
            return null;
        },

        //根据ID获取该窗体
        closeBoxByID: function (id) {
            if (this.boxList[id]) {
                this.boxList[id].close();
            }
        },

        //工厂
        JohnBox: function (config) {

            var johnBox = null;
            var _rurl = /^url:/;
            var isFrame = _rurl.test(config.content);
            switch (!!config.inRight) {
                case true:
                    switch (isFrame) {
                        case true:
                            johnBox = new IframeRightBox(config);
                            break;
                        case false:
                            johnBox = new ContentRightBox(config);
                            break;
                    }
                    break;
                case false:
                    switch (isFrame) {
                        case true:
                            johnBox = new IframeBox(config);
                            break;
                        case false:
                            johnBox = new ContentBox(config);
                            break;
                    }
                    break;
            }
            return johnBox;         
        },

        _initConfig: function (config) {

            config = config || {};

            // 合并默认配置
            for (var i in this.setting) {
                if (config[i] === undefined) config[i] = this.setting[i];
            }

            config.id = config.id || 'JohnLiu' + (+new Date);

            config.left = config.left || ($("body").width() - config.width) / 2;
            config.left = config.left < 0 ? 0 : config.left;
            config.top = config.top || ($("body").height() - config.height) / 2;
            config.top = config.top < 0 ? 0 : config.top;

            return config;
        }

    },
        _body = window.document.body
        _doc = window.document;


    /*
     *  Box  窗体基类
     * 默认支持： 关闭/最小化/还原/定位到最小化窗体/
     * 插入组件： 右侧滚动条  功能： 侧边栏滚动
     */
    function Box(config) {
        this.state = {
            //初始化完成
            init: "init",
            //打开状态
            open: "open",
            //最小化
            min: "min",
            //最大化
            max: "max"
        };
        this.DOM = {};
        this.config = {}; //当前配置
        //this.init(config);
    };

    Box.prototype = {
        constructor:Box,
        /*
           *  初始化
           * 1. 构造当前窗体DOM树 
           * 2. 应用配置到DOM树
           * 
           * 备注： 子类构造函数中需要调用此方法
           */
        init: function (config) {
            this.DOM = this._getDOM(config);
            this._DOMConstructed(config);
            this.injectEvent();
        },
        /*
          *  构造DOM树
          *  备注：在内存中构造窗体对象的DOM树，此时还未添加到document上
          */
        _getDOM: function (config) {
            var $wrap = $('<div></div>');
            //$wrap.css({ "visibility": "visible" });
            $wrap.html(JohnBox.boxTemplate);

            var $wrapmin = $('<div></div>');
            $wrapmin.css({ "display": "none" });
            $wrapmin.addClass('rightBox');
            $wrapmin.html(JohnBox.rightMinTemplate);

            var name, i = 0, DOM = {
                config: config,
                wrap: $wrap,
                wrapmin: $wrapmin,
                //init,normal,min,max,
                state: this.state.init,
            };

            $.each($wrap.find("div"), function (i, item) {
                name = item.className.split('johnUI_')[1];
                if (name) DOM[name] = item;
            });

            $.each($wrapmin.find("div"), function (i, item) {
                name = item.className.split("johnUI_")[1];
                if (name) DOM[name] = item;
            });

            return DOM;
        },
        /*
           *  DOM构造完成，开始应用配置
           *  备注：DOM构造完成，将配置里面的 标题/最小按钮/图标/窗体宽高/ css 应用到Box树上
           */
        _DOMConstructed: function (config) {
            $(this.DOM.title).html(config.title);
            $(this.DOM.minBoxMin).html(config.title);
            var img = '<img src="' + config.icon + '"/>';
            $(this.DOM.icon).html(img);
            $(this.DOM.minIcon).html(img);
            $(this.DOM.boxReal).width(config.width);
            $(this.DOM.boxReal).height(config.height);

            $(this.DOM.btnMin).css("display", config.min ? "block" : "none");
        },
        /*
          * 往构造完成的窗体DOM树注入事件
          * 备注：此时DOM树尚未添加到document
          */
        injectEvent: function () {
            $(this.DOM.btnMin).click(this.min.bind(this));
            $(this.DOM.minIcon).click(this.reback.bind(this));
            $(this.DOM.titleBar).mouseenter(mouseEnterTitleBar.bind(this));
            $(this.DOM.btnClose).click(this.close.bind(this));
            function mouseEnterTitleBar(e) {
                if (this.DOM.config.drag && !this.DOM.config.inRight) {
                    $(this.DOM.titleBar).css("cursor", "move");
                    $(this.DOM.titleBar).mousedown(this.__onMoveStart.bind(this));
                    $(this.DOM.titleBar).mouseup(this.__onMoveEnd.bind(this));
                }
            }
        },
        /*
         * 显示，将构造完成的DOM树添加到文档中
         * 备注： 此时窗体控件
         */
        show: function () {
            var thisDOM = this.DOM;
            var allWidth = $("body").width() + thisDOM.wrap.width();
            var that = this;
            switch (thisDOM.state) {
                case this.state.init:
                    thisDOM.state = this.state.open;
                    $(thisDOM.config.rightLayout).append(thisDOM.wrapmin);
                    if (thisDOM.config.inRight) {
                        $(thisDOM.wrap).css({ "margin-top": "10px" }).addClass("rightBox");
                        $(thisDOM.config.rightLayout).append(thisDOM.wrap);
                        this.location2Scroll(thisDOM);
                    } else {
                        $(thisDOM.boxReal).css('display', 'block');
                        $(thisDOM.wrap).css({
                            "z-index": JohnBox.zIndex,
                            "position": "absolute",
                            "left": allWidth + 30,
                            "top": thisDOM.config.top,
                            'display': 'block',
                            "margin-top": "0px",
                        }).appendTo(thisDOM.config.rootLayout).animate({
                            left: thisDOM.config.left
                        }, 600, "swing", function () {
                            if (thisDOM.config.showCompleted && $.isFunction(thisDOM.config.showCompleted)) {
                                thisDOM.config.showCompleted();
                            }
                        });
                        if (that.DOM.childrenIframe) {
                            var data = that.DOM.config.data == undefined ? {} : that.DOM.config.data;
                            that.DOM.childrenIframe.ready(function () {
                                that.window = that.DOM.childrenIframe[0].contentWindow;
                                that.DOM.childrenIframe[0].contentWindow.data = data;
                            })
                        }
                    }
                    break;
                case this.state.open:
                    this.location2Scroll(thisDOM);
                    break;
                case this.state.min:
                    this.reback(function () {
                        this.location2Scroll(thisDOM);
                    });
                    break;
                case this.state.max: break;
            }
        },
        //关闭
        close: function (fnCallBack) {
            var pDOM = this.DOM
            var This = this;
            if (JohnBox.boxList.length == 0) {
                JohnBox.zIndex = 10;
            } else {
                JohnBox.zIndex--;
            }
            if (pDOM.config.inRight) {
                $(pDOM.wrap).fadeOut(function () {
                    removeCompleted();
                });
            } else {
                var left = pDOM.wrap.width();
                $(pDOM.wrap).animate({
                    left: -left
                }, 400, "swing", function () {
                    removeCompleted();
                });
            }
            function removeCompleted() {
                pDOM.wrap.remove();
                pDOM.wrapmin.remove();
                This.refreshScroll();
                if (JohnBox.boxList[pDOM.config.id]) {
                    delete JohnBox.boxList[pDOM.config.id];
                }
                if (pDOM.config.closeCompleted && $.isFunction(pDOM.config.closeCompleted)) {
                    pDOM.config.closeCompleted();
                }
                if (fnCallBack && $.isFunction(fnCallBack)) {
                    fnCallBack.call(This);
                }
            }
        },
        //最小化
        min: function (fnCallBack) {
            var pDOM = this.DOM;
            var This = this;
            if (pDOM.state == this.state.max) {
                this.reset(function () {
                    min();
                });
            } else {
                min();
            }
            function min() {
                pDOM.state = "min";
                var allWidth = $("body").width() + pDOM.wrap.width();
                //pDOM.wrap.addClass('rightBox');
                $(pDOM.boxReal).animate({
                    width: 0,
                    height: 0
                }, 300, function () {
                    //location2right ...                
                    $(pDOM.wrap).css({ "display": "none", "left": allWidth + 30 });
                    $(pDOM.wrapmin).css({ "display": "block" });
                    //刷新右侧滚动条                    
                    pDOM.config.inRight ? This.refreshScroll() : This.location2Scroll(pDOM);
                    $(pDOM.minBoxMin).animate({ width: 160, height: 30 }, 300, function () {
                        $(pDOM.minIcon).animate({ left: 110 }, 300);
                        if (fnCallBack && $.isFunction(fnCallBack)) {
                            fnCallBack.call(This);
                        }
                    });
                });
            }
        },
        //定位到当前控件
        location2Scroll: function (pDOM) {
            var $rightLayout = $(JohnBox.rightLayout);

            this.refreshScroll();

            var marginTop = 0;
            var boxs = $rightLayout.find(".rightBox:visible");
            for (var i = 0; i < boxs.length ; i++) {
                if (boxs[i] == pDOM.wrap[0] || boxs[i] == pDOM.wrapmin[0]) {
                    break;
                }
                marginTop = marginTop + $(boxs[i]).height() + 10;
            }
            var contentH = $(JohnBox.rightLayout).height();
            var windowH = $(JohnBox.rightLayout).parent().height() - JohnBox.rightMinBottom;
            var maxValue = contentH - windowH;
            if (maxValue > 0) {
                marginTop = marginTop > maxValue ? maxValue : marginTop;
                $(JohnBox.rightLayout).animate({ "margin-top": -marginTop }, 300, function () {
                    $(JohnBox.sliderBar).slider("setValue", marginTop);
                });
            }
        },
        //还原
        reback: function (fnCallBack) {
            var pDOM = this.DOM;
            var This = this;
            pDOM.state = this.state.open;
            $(pDOM.minBoxMin).animate({
                width: 0,
                height: 0
            }, 300, function () {
                $(pDOM.wrapmin).css({ "display": "none" });
                $(pDOM.wrap).css({ "display": "block" });
                $(pDOM.boxReal).animate({
                    width: pDOM.config.width,
                    height: pDOM.config.height
                }, 300, function () {
                    if (!pDOM.config.inRight) {
                        $(pDOM.wrap).animate({ left: pDOM.config.left }, 600);
                    }
                    This.refreshScroll();
                    This.__onSizeChanged(pDOM);
                    if (fnCallBack && $.isFunction(fnCallBack)) {
                        fnCallBack.call(This);
                    }
                });
            });
        },
        //刷新滚动条
        refreshScroll: function () {
            var lastHeight = 0;
            var $rightLayout = $(JohnBox.rightLayout);

            if ($rightLayout.prev().find(JohnBox.sliderBar).length == 0) {
                this.loadScroll();
            }
            var contentH = $(JohnBox.rightLayout).height();
            var windowH = $(JohnBox.rightLayout).parent().height() - JohnBox.rightMinBottom;
            var maxValue = contentH - windowH;
            var checkH = lastHeight - contentH;
            if (checkH > 0) {
                var marginTop = parseFloat($(JohnBox.rightLayout).css("marginTop")) + checkH;
                marginTop = marginTop > 0 ? 0 : marginTop;
                $(JohnBox.rightLayout).animate({ "margin-top": marginTop });
            }
            lastHeight = contentH;
            if (maxValue > 0) {
                $(JohnBox.sliderBar).slider({ max: maxValue, disabled: false });
            } else {
                $(JohnBox.sliderBar).slider("setValue", 0);
                $(JohnBox.sliderBar).slider({ max: 0, disabled: true });
            }

            if ($rightLayout.height() > 0) {
                $("#johnUI_rightBoxBar").fadeIn();
            } else {
                $("#johnUI_rightBoxBar").fadeOut();
            }
        },
        //加载滚动条
        loadScroll: function () {
            $(JohnBox.rightLayout).before(JohnBox.rightBarTemplate);
            $(JohnBox.sliderBar).slider({
                mode: 'v',
                height: '200px',
                reversed: true,
                min: 0,
                tipFormatter: function (value) {
                    return value + '%';
                },
                onChange: function (newV, oldV) {
                    $(JohnBox.rightLayout).css({ "margin-top": -newV });
                },
                style: { "margin-bottom": "10px" }
            });
            $('div.johnUI_boxUp').click(function () {
                var curValue = $(JohnBox.sliderBar).slider('getValue');
                var contentH = $(JohnBox.rightLayout).height();
                var windowH = $(JohnBox.rightLayout).parent().height() - JohnBox.rightMinBottom;
                var maxValue = contentH - windowH;
                if (curValue > 0) {
                    //总计10次点击
                    var step = Math.ceil(maxValue / 10);
                    var newValue = curValue - step;
                    newValue = newValue > 0 ? newValue : 0;
                    $(JohnBox.rightLayout).animate({ "margin-top": -newValue }, 300, function () {
                        $(JohnBox.sliderBar).slider("setValue", newValue);
                    });
                }
            });
            $('div.johnUI_boxDown').click(function () {
                var curValue = $(JohnBox.sliderBar).slider('getValue');
                var contentH = $(JohnBox.rightLayout).height();
                var windowH = $(JohnBox.rightLayout).parent().height() - JohnBox.rightMinBottom;
                var maxValue = contentH - windowH;
                if (curValue < maxValue) {
                    //总计10次点击
                    var step = Math.ceil(maxValue / 10);
                    var newValue = curValue + step;
                    newValue = newValue > maxValue ? maxValue : newValue;
                    $(JohnBox.rightLayout).animate({ "margin-top": -newValue }, 300, function () {
                        $(JohnBox.sliderBar).slider("setValue", newValue);
                    });
                }
            });
            $('div.johnUI_boxHide').click(function () {
                if (JohnBox.expandState) {
                    $(JohnBox.rightLayout).fadeOut();
                    $('div.johnUI_boxHide').addClass("johnUI_boxShow");
                    JohnBox.expandState = false;
                } else {
                    $(JohnBox.rightLayout).fadeIn();
                    $('div.johnUI_boxHide').removeClass("johnUI_boxShow");
                    JohnBox.expandState = true;
                }
            });
            this.rightBoxScroll();
        },
        //侧边栏滚动
        rightBoxScroll: function () {
            //侧边栏滚动
            $('#johnUI_rightBoxBar')[0].addEventListener('mousewheel', function (e) {
                var event = e || window.event;
                var curValue = $(JohnBox.sliderBar).slider('getValue');
                var contentH = $(JohnBox.rightLayout).height();
                var windowH = $(JohnBox.rightLayout).parent().height() - JohnBox.rightMinBottom;
                var maxValue = contentH - windowH;

                if (event.wheelDelta < 0) {
                    if (curValue < maxValue) {
                        //总计10次点击
                        var step = Math.ceil(maxValue / 10);
                        var newValue = curValue + step;
                        newValue = newValue > maxValue ? maxValue : newValue;
                        $(JohnBox.sliderBar).slider("setValue", newValue);
                    }

                } else {
                    if (curValue > 0) {
                        //总计10次点击
                        var step = Math.ceil(maxValue / 10);
                        var newValue = curValue - step;
                        newValue = newValue > 0 ? newValue : 0;
                        $(JohnBox.sliderBar).slider("setValue", newValue);
                    }
                }

            }, false);
        }
    };



    /*
     *  ContentBox 继承自Box
     * 普通弹出窗，只支持内部conten用HTML 填充
     * 扩展了： 可拖拽/拖动窗体大小
     */
    function ContentBox(config) {

        Box.call(this, config); //借调构造函数

        //this.init = function (c) {
        //    this._DOMConstructed(config);
        //    this.injectEvent();
        //}

        this.init(config);

        this._content = function () {
            var pDOM = this.DOM;
            $(pDOM.content).html(pDOM.config.content);
        };
        this._content();

        //设置置顶
        function setIndex() {
            var pDOM = this.DOM;
            JohnBox.zIndex++;
            pDOM.wrap.css({ "z-index": JohnBox.zIndex });
        };
        $(this.DOM.btnSize).css("display", (config.resize && !config.inRight) ? "block" : "none");
        $(this.DOM.wrap).mousedown(setIndex.bind(this));
    };
    ContentBox.prototype = Object.create(Box.prototype);
    ContentBox.prototype.constructor = ContentBox;
    //拖拽
    ContentBox.prototype.__onMoveStart = function (e) {
        var pDOM = this.DOM;
        if (e.target !== pDOM.titleBar) {
            return;
        }
        if (!pDOM.config.drag) {
            return;
        }
        pDOM.config.drag = true;
        pDOM.dragging = true
        var myBox;
        for (myBox in JohnBox.boxList) {
            if (JohnBox.boxList.hasOwnProperty(myBox)) {
                $(JohnBox.boxList[myBox].DOM.contentCover).show();
            }
        }
        window.onmousemove = this.__onMoveDrag.bind(this);
        window.onmouseup = this.__onMoveEnd.bind(this);
        $(pDOM.titleBar)[0].setCapture && $(pDOM.titleBar)[0].setCapture();
        pDOM.wrap[0].lastPoint = {
            x: e.clientX - pDOM.wrap[0].offsetLeft,
            y: e.clientY - pDOM.wrap[0].offsetTop
        };
    };
    ContentBox.prototype.__onMoveDrag = function (e) {
        var pDOM = this.DOM;
        var lastPoint = pDOM.wrap[0].lastPoint;
        if (pDOM.dragging) {
            var e = e || window.event;
            var oX = e.clientX - lastPoint.x;
            var oY = e.clientY - lastPoint.y;
            var maxWidth = $("body").width() - 60;//pDOM.config.width
            var maxHeight = $("body").height() - 60;//pDOM.config.height
            oX = Math.max(0, oX);
            oY = Math.max(0, oY);
            oX = Math.min(oX, maxWidth);
            oY = Math.min(oY, maxHeight);
            pDOM.config.left = oX;
            pDOM.config.top = oY;

            $(pDOM.wrap).css(
            {
                "left": pDOM.config.left,
                "top": pDOM.config.top
            });
            this._clsSelect();
        }
    };
    ContentBox.prototype.__onMoveEnd = function (e) {
        var pDOM = this.DOM;
        if (e.target !== pDOM.titleBar) {
            return;
        }
        window.onmousemove = null;
        window.onmouseup = null;
        var myBox;
        for (myBox in JohnBox.boxList) {
            if (JohnBox.boxList.hasOwnProperty(myBox)) {
                $(JohnBox.boxList[myBox].DOM.contentCover).hide();
            }
        }
        pDOM.dragging = false;
        $(pDOM.titleBar)[0].releaseCapture && $(pDOM.titleBar)[0].releaseCapture();
    };
    //清除选中文本
    ContentBox.prototype._clsSelect = function () {
        // 清除文本选择
        if ('getSelection' in window.top) {
            window.top.getSelection().removeAllRanges()
        }
        else {
            try {
                window.document.selection.empty();
            } catch (e) {

            };
        }
    };
    //拖动大小
    ContentBox.prototype.__onResizeStart = function (e) {
        var pDOM = this.DOM;
        if (!pDOM.config.resize) {
            return;
        }
        pDOM.resizedragging = true;
        var myBox;
        for (myBox in JohnBox.boxList) {
            if (JohnBox.boxList.hasOwnProperty(myBox)) {
                $(JohnBox.boxList[myBox].DOM.contentCover).show();
            }
        }
        window.onmousemove = this.__onResizeDrag.bind(this);
        window.onmouseup = this.__onResizeEnd.bind(this);
        $(pDOM.btnSize)[0].setCapture && $(pDOM.btnSize)[0].setCapture();
        pDOM.wrap[0].lastPoint = {
            x: e.clientX - pDOM.config.width,
            y: e.clientY - pDOM.config.height
        };
    };
    ContentBox.prototype.__onResizeDrag = function (e) {
        var pDOM = this.DOM;
        var lastPoint = pDOM.wrap[0].lastPoint
        if (pDOM.resizedragging) {
            var e = e || window.event;
            var oX = e.clientX - lastPoint.x;
            var oY = e.clientY - lastPoint.y;
            var maxWidth = $("body").width() - pDOM.config.left;
            var maxHeight = $("body").height() - pDOM.config.top;
            oX = Math.min(maxWidth, oX);
            oY = Math.min(maxHeight, oY);
            oX = Math.max(100, oX);
            oY = Math.max(30, oY);
            pDOM.config.width = oX;
            pDOM.config.height = oY;

            //$(pDOM.box).width(pDOM.config.width);
            $(pDOM.boxReal).width(pDOM.config.width);
            $(pDOM.boxReal).height(pDOM.config.height);

            this._clsSelect();
        }
    };
    ContentBox.prototype.__onResizeEnd = function (e) {
        var pDOM = this.DOM;
        window.onmousemove = null;
        window.onmouseup = null;
        var myBox;
        for (myBox in JohnBox.boxList) {
            if (JohnBox.boxList.hasOwnProperty(myBox)) {
                $(JohnBox.boxList[myBox].DOM.contentCover).hide();
            }
        }
        //$(pDOM.contentCover).hide();
        pDOM.resizedragging = false;
        $(pDOM.btnSize)[0].releaseCapture && $(pDOM.btnSize)[0].releaseCapture();
        this.__onSizeChanged(pDOM);
    };
    ContentBox.prototype.__onSizeChanged = function (pDOM) {
        if (pDOM.config.sizeChanged && $.isFunction(pDOM.config.sizeChanged)) {
            pDOM.config.sizeChanged();
        }
        return true;
    };
    //----------------ContentBox 结束----------------------------------


    /*
     *  IframeBox 继承自  ContentBox
     *  只支持内容content 用iframe 填充
     *  扩展了：  窗口最大化，向下还原（最大化之后）
     */
    function IframeBox(config) {
        ContentBox.call(this, config);

        this.init(config);

        this._content = function () {
            var pDOM = this.DOM;
            var iframe = $("<iframe width='100%' height='100%' id='iframe" + pDOM.config.id
            + "'  frameborder='no' marginheight='0' marginwidth='0' allowTransparency='true'></iframe>");
            var url = pDOM.config.content.split('url:')[1]
            iframe.attr("src", url);
            if (this.DOM.config.iframeLoadedCompleted && $.isFunction(this.DOM.config.iframeLoadedCompleted)) {
                var fn = this.DOM.config.iframeLoadedCompleted
                iframe[0].onload = fn.bind(window);
            }
            this.DOM.childrenIframe = iframe;
            $(pDOM.content).html(iframe);
        };
        this._content();

        if (config.resize) {
            $(this.DOM.btnSize).css("display", "block");
            $(this.DOM.btnSize).mousedown(this.__onResizeStart.bind(this));
        }


        $(window).resize(this.__onMaxBoxAuto.bind(this));
        //后面的hook
        $(this.DOM.btnMax).css("display", (config.max && !config.inRight) ? "block" : "none");

        $(this.DOM.btnMax).click(this.max.bind(this));
        $(this.DOM.btnReset).click(this.reset.bind(this));
    };
    IframeBox.prototype = Object.create(ContentBox.prototype);
    IframeBox.prototype.constructor = IframeBox;
    IframeBox.prototype.show = function () {
        var thisDOM = this.DOM;
        var allWidth = $("body").width() + thisDOM.wrap.width();
        var that = this;
        switch (thisDOM.state) {
            case this.state.init:
                thisDOM.state = this.state.open;
                $(thisDOM.config.rightLayout).append(thisDOM.wrapmin);  
                $(thisDOM.boxReal).css('display', 'block');
                $(thisDOM.wrap).css({
                    "z-index": JohnBox.zIndex,
                    "position": "absolute",
                    "left": allWidth + 30,
                    "top": thisDOM.config.top,
                    'display': 'block',
                    "margin-top": "0px",
                }).appendTo(thisDOM.config.rootLayout).animate({
                    left: thisDOM.config.left
                }, 600, "swing", function () {
                    if (thisDOM.config.showCompleted && $.isFunction(thisDOM.config.showCompleted)) {
                        thisDOM.config.showCompleted();
                    }
                });
                if (that.DOM.childrenIframe) {
                    var data = that.DOM.config.data == undefined ? {} : that.DOM.config.data;
                    that.DOM.childrenIframe.ready(function () {
                        that.window = that.DOM.childrenIframe[0].contentWindow;
                        that.DOM.childrenIframe[0].contentWindow.data = data;
                    })
                }             
                break;
            case this.state.open:
                this.location2Scroll(thisDOM);
                break;
            case this.state.min:
                this.reback(function () {
                    this.location2Scroll(thisDOM);
                });
                break;
            case this.state.max: break;
        }
    };
    IframeBox.prototype.max = function () {
        var pDOM = this.DOM;
        var This = this;
        pDOM.state = this.state.max;
        $(pDOM.wrap).animate({
            "left": 0,
            "top": 0
        }, 300, function () {
            $(pDOM.boxReal).animate({
                width: $(top.window).width(),
                height: $(top.window).height()
            }, 300, function () {
                $(pDOM.icon).animate({
                    left: -20
                }, 300);
                $(pDOM.btnMax).css('display', 'none');
                $(pDOM.btnReset).css('display', 'block');
                pDOM.config.drag = false;
                if (pDOM.config.resize) {
                    pDOM.config.resize = false;
                }
                This.__onSizeChanged(pDOM);
            })
        });

    };
    IframeBox.prototype.reset = function (fnCallBack) {
        var pDOM = this.DOM;
        var This = this;
        pDOM.state = this.state.open;
        $(pDOM.boxReal).animate({
            width: pDOM.config.width,
            height: pDOM.config.height
        }, 300, function () {
            $(pDOM.wrap).animate({
                "margin-top": "0px",
                "left": pDOM.config.left,
                "top": pDOM.config.top
            }, 300, function () {
                $(pDOM.icon).css({
                    left: -20
                });
                $(pDOM.btnMax).css('display', 'block');
                $(pDOM.btnReset).css('display', 'none');
                pDOM.config.drag = true;
                pDOM.config.resize = true;
                if (fnCallBack && $.isFunction(fnCallBack)) {
                    fnCallBack();
                }
                This.__onSizeChanged(pDOM);
            });
        })
    };
    //窗体最大化后自适应窗体变化
    IframeBox.prototype.__onMaxBoxAuto = function () {
        var pDOM = this.DOM;
        if (pDOM.state == this.state.max) {
            $(pDOM.boxReal).width($(top.window).width());
            $(pDOM.boxReal).height($(top.window).height());
        }
    };
    //---------------IframeBox 结束-------------------------------------

    /*
     *  IframeRightBox 继承自 iframeBox
     *  
     */
    IframeRightBox = function (config) {
        IframeBox.call(this, config);
    }
    IframeRightBox.prototype = Object.create(IframeBox.prototype);
    IframeRightBox.prototype.constructor = IframeRightBox;
    IframeRightBox.prototype.show = function () {
        var thisDOM = this.DOM;
        var allWidth = $("body").width() + thisDOM.wrap.width();
        var that = this;
        switch (thisDOM.state) {
            case this.state.init:
                thisDOM.state = this.state.open;
                $(thisDOM.config.rightLayout).append(thisDOM.wrapmin);
                $(thisDOM.wrap).css({ "margin-top": "10px" }).addClass("rightBox");
                $(thisDOM.config.rightLayout).append(thisDOM.wrap);
                this.location2Scroll(thisDOM);
                break;
            case this.state.open:
                this.location2Scroll(thisDOM);
                break;
            case this.state.min:
                this.reback(function () {
                    this.location2Scroll(thisDOM);
                });
                break;
            case this.state.max: break;
        }
    };
    //---------------IframeRightBox 结束-------------------------------------


    /*
     *  ContentRightBox 继承自 ContentBox
     */
    ContentRightBox = function (config) {
        ContentBox.call(this, config);
    }
    ContentRightBox.prototype = Object.create(ContentBox.prototype);
    ContentRightBox.prototype.constructor = ContentRightBox;
    ContentRightBox.prototype.show = function () {
        var thisDOM = this.DOM;
        var allWidth = $("body").width() + thisDOM.wrap.width();
        var that = this;
        switch (thisDOM.state) {
            case this.state.init:
                thisDOM.state = this.state.open;
                $(thisDOM.config.rightLayout).append(thisDOM.wrapmin);
                $(thisDOM.wrap).css({ "margin-top": "10px" }).addClass("rightBox");
                $(thisDOM.config.rightLayout).append(thisDOM.wrap);
                this.location2Scroll(thisDOM);
                break;
            case this.state.open:
                this.location2Scroll(thisDOM);
                break;
            case this.state.min:
                this.reback(function () {
                    this.location2Scroll(thisDOM);
                });
                break;
            case this.state.max: break;
        }
    };
    //---------------ContentRightBox 结束-------------------------------------


    //文档加载完成执行事件
    $(function () {
        //先检查页面有无boxContent DIV
        if ($(JohnBox.rootLayout).length  ==  0) {
            $(_doc.body).append("<div id=" + JohnBox.rootLayout.substring(1) + " class="+JohnBox.rootLayout.substring(1)+"></div>")
        }

    });



    window["Freedom"].JohnBox = {
        init:JohnBox.init
    };
    window.Freedom.JohnBox.getBox = $.JohnBox = JohnBox.getBox;
    window.Freedom.JohnBox.closeBoxByID = JohnBox.closeBoxByID;


})(this.jQuery,window);

/*!
 *------------------------------------------------
 * JohnBox其它功能扩展模块（可选外置模块）
 *------------------------------------------------
 */
(function ($,JohnBox,undefined) {
    var _zIndex = function()
    {
        return lhgdialog.setting.zIndex;
    };

    JohnBox.alert = function (content, callback, parent) {
        return JohnBox.getBox({
            title: '警告',
            id: 'Alert',
            zIndex: _zIndex(),
            icon: 'alert.gif',
            fixed: true,
            lock: true,
            content: content,
            ok: true,
            resize: false,
            close: callback,
            parent: parent || null
        });
    };

})($,window.Freedom.JohnBox);

