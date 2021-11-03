$(document).ready(function () {
    let windowWidth = $(window).width(); 

    let tableHeader = ["作物名稱", "市場名稱", "上價", "中價", "下價", "平均價", "交易量"];
    let dataLoadOK = false;
    let tableData = [];
    let filterData = [];
    const onePageNum = 30;
    let pageNow = 0;
    let pageAll = 0;
    let typeList = [
        { 種類: "蔬菜", 代碼: ["N04"] },
        { 種類: "水果", 代碼: ["N05"] },
        { 種類: "花卉", 代碼: ["N06", "   "] }
    ];

    const list = $(".main table");
    const select = $("select");

    let listHeader = `<tr class="list-header">`;
    let selectItem = "";
    $.each(tableHeader, function (index, value) {
        if(value == "作物名稱" || value == "市場名稱") {
            listHeader += `<th>${value.substr(0, 2)}<span>${value.substr(2, 2)}</span></th>`;
        } else {
            listHeader += `<th class="th-sort">${value}`;
            listHeader += `<i class="fas fa-sort-up"></i><i class="fas fa-sort-down"></i></th>`;
            if($(select).parent().hasClass("select-mb")) { // 手機模式
                selectItem += `<option value="${value}">${value}</option>`;
            } else {
                selectItem += `<option value="${value}">依 ${value} 排序</option>`;
            }
        }
    });
    listHeader += `</tr><tr class="list-item"><td colspan="${tableHeader.length}">請輸入並搜尋想比價的作物名稱^＿^</td></tr>`;
    list.append(listHeader);
    select.append(selectItem);

    $(".type li").on("click", function () {
        $(".type li").removeClass("type-active");
        $(this).addClass("type-active");
    });

    $(".search-btn").on("click", function () {
        // 清空網頁暫存檔案
        tableData = [];
        dataLoadOK = false;
        // 移除所有 sort 畫面顯示
        $("table i").removeClass("sort-active");
        // 隱藏頁碼顯示
        $(".tablePage").css("visibility", "hidden");
        // 抓取資料
        axios.get('https://hexschool.github.io/js-filter-data/data.json')
        .then(function(response){
            if(response.status == "200") {
                setTimeout(function() {
                    dealData(response.data);
                    dataLoadOK = true;
                }, 1000);
            }
        });
        // 調整畫面顯示：資料載入中
        showList("loading");
    });

    $("table th").on("click", function (e) {
        // 未讀取資料，不做排序
        if(!dataLoadOK) { return; }
        let th;
        if(e.target.nodeName === "I") {
            th = $(e.target).parent();
        } else {
            th = $(e.target);
        }
        let sortUpElement = th.find(".fa-sort-up");
        let sortDownElement = th.find(".fa-sort-down");
        let sortUp = $(sortUpElement).hasClass("sort-active");
        // let sortDown = $(sortDownElement).hasClass("sort-active");
        // 移除所有 sort 畫面顯示
        $("table i").removeClass("sort-active");
        if(sortUp) { // 調整成降冪排序
            filterData.sort(function(a, b) {
                return b[th.text()] - a[th.text()];
            });
            $(sortDownElement).addClass("sort-active");
        } else { // 調整成升冪排序
            filterData.sort(function(a, b) {
                return a[th.text()] - b[th.text()];
            });
            $(sortUpElement).addClass("sort-active");
        }
        pageNow = 1;
        showList("done");
    });

    function dealData(data) {
        tableData = data;
        
        let type = $(".type .type-active").text();
        let name = $(".search form input[type=text]").val().trim();
        let checkList = typeList.find(x => x["種類"] == type)["代碼"];
        filterData = tableData.filter(function(item, index, array) {
            let checkItem = false;
            if(checkList.indexOf(item["種類代碼"]) != -1) {
                if(name == "") {
                    checkItem = true;
                } else {
                    if(item['作物名稱'].indexOf(name) != -1) {
                        checkItem = true;
                    }
                    $(".search form input[type=text]").val("");
                }
            }
            return checkItem;
        });
        // console.log(tableData.length, filterData.length);
        pageAll = Math.ceil(filterData.length / onePageNum);
        pageNow = pageAll > 0 ? 1 : 0;

        showList("done");
    }

    function showList(staus) {        
        let listItem = '';
        $(list).find("tr").remove(".list-item");
        if(staus == "loading") {
            // 更新表格顯示資訊：資料載入中
            listItem = `<tr class="list-item"><td colspan="${tableHeader.length}">資料載入中...</td></tr>`;
            // 更新 h2 文字
            let type = $(".type .type-active").text();
            let name = $(".search form input[type=text]").val().trim();
            if(name == "") {
                $(".select h2 span").text(`「${type}」的`);
            } else {
                $(".select h2 span").text(`「${name}」的`);
            }
            $(".select h2 span").css("display", "block");
        } else {
            if(pageAll == 0) {
                // 更新表格顯示資訊：查無資料
                listItem = `<tr class="list-item"><td colspan="${tableHeader.length}">查詢不到當日的交易資訊QQ</td></tr>`;
                // console.log("1", "windowWidth", windowWidth);
                if(windowWidth <= 568) {
                    $(".select-mb").css("display", "none");
                }
            } else {
                let count = 0;
                let i = (pageNow - 1) * onePageNum;
                for(; i < filterData.length && count < onePageNum; i++) {
                    listItem += `<tr class="list-item">`;
                    let cropName = filterData[i]['作物名稱'];
                    if(windowWidth <= 568) {
                        let cropNameArr = cropName.split('-');
                        listItem += `<td class="font-bold">${cropNameArr[0]}</td>`;
                    } else {
                        listItem += `<td class="font-bold">${cropName}</td>`;
                    }
                    listItem += `<td class="font-bold">${filterData[i]['市場名稱']}</td>`;
                    listItem += `<td>${filterData[i]['上價']}</td>`;
                    listItem += `<td>${filterData[i]['中價']}</td>`;
                    listItem += `<td>${filterData[i]['下價']}</td>`;
                    listItem += `<td>${filterData[i]['平均價']}</td>`;
                    listItem += `<td>${filterData[i]['交易量']}</td>`;
                    listItem += `</tr>`;
                    count++;
                }
                showPage();
                // console.log("2", "windowWidth", windowWidth);
                if(windowWidth <= 568) {
                    $(".select-mb").css("display", "block");
                }
            }
        }
        $(list).append(listItem);
    }
    
    function showPage() {
        let prevElement = $(".prev");
        $(".tablePage li").remove(".page-num");
        // console.log("now", pageNow, typeof pageNow, "all", pageAll);
        let count = 0;
        for(let i = -2; i < 5; i++) {
            let nextPage = pageNow + i;
            // console.log("nextPage", nextPage);
            if(nextPage >= 1 && nextPage <= pageAll) {
                // nextPage++;
                if(nextPage == pageNow){
                    $(`<li class="page-num page-num${nextPage} page-active" data-page=${nextPage}>${nextPage}</li>`).insertAfter($(prevElement));
                }
                else{
                    $(`<li class="page-num page-num${nextPage}" data-page=${nextPage}>${nextPage}</li>`).insertAfter($(prevElement));
                }
                prevElement = $(prevElement).parent().find(`li.page-num${nextPage}`);
                count++;
                if(count == 5){
                    break;
                }
            }
        }
        // console.log("now", pageNow, typeof pageNow, "all", pageAll);
        $(".prev").attr("data-page", pageNow - 1);
        $(".next").attr("data-page", pageNow + 1);
        if(pageNow == 1) {
            $(".prev").addClass("page-not-active");
        } else {
            $(".prev").removeClass("page-not-active");
        } 
        if(pageNow == pageAll) {
            $(".next").addClass("page-not-active");
        } else {
            $(".next").removeClass("page-not-active");
        }
        $(".tablePage").css("visibility", "visible");
    }

    $(".tablePage").on("click", function (e) {
        let element;
        if(e.target.nodeName === "I"){
            element = $(e.target).parent();
        } else {
            element = $(e.target);
        }
        if($(element).hasClass("page-not-active") || $(element).hasClass("page-active")) {
            return;
        }
        pageNow = parseInt($(element).attr("data-page"));
        showList("done");
    });

    // $("select").on("click", function (e) {
    $("select").on("change", function (e) {
        console.log(e.target.value);
        let select = e.target.value;
        if(select == "") {
            return;
        }
        // 降冪排列
        filterData.sort(function(a, b) {
            return a[select] - b[select];
        });
        pageNow = 1;
        showList("down");
    });

    function test(check, page) {
        let times = 1;
        let count = 0;
        let temp = [];
        $.each(filterData, function (index, element) {
            if(times > page) {
                return false;
            } else if(times < page){
                console.log(index);
            } else {
                if(element["種類代碼"] == check) {
                    temp.push(element["作物名稱"]);
                }
            }
            count++;
            if(count >= onePageNum){
               count = 0;
               times++;
            }
        });
        console.log(temp);
    }
});