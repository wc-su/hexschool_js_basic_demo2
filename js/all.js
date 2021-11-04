$(document).ready(function () {
    const categoryList = [
        { 種類: "蔬菜", 代碼: ["N04"] },
        { 種類: "水果", 代碼: ["N05"] },
        { 種類: "花卉", 代碼: ["N06", "   "] }
    ];
    const tableHeader = ["作物名稱", "市場名稱", "上價", "中價", "下價", "平均價", "交易量"];

    let dataLoadOK = false; // 資料載入是否成功
    let tableData = []; // 載入資料
    let filterData = []; // 篩選後資料
    const onePageNum = 30; // 畫面一頁顯示最多筆數
    let pageAll = 0; // 全部頁數
    let pageNow = 0; // 目前頁數

    const table = $(".main table");

    // 載入 table header
    let headerText = `<tr class="list-header">`;
    $.each(tableHeader, function (index, value) {
        if(value == "作物名稱" || value == "市場名稱") {
            headerText +=
                `<th>${value.substr(0, 2)}<span>${value.substr(2, 2)}</span></th>`;
        } else {
            headerText +=
                `<th class="th-sort">${value}<i class="fas fa-sort-up"></i><i class="fas fa-sort-down"></i></th>`;
        }
    });
    headerText += 
        `</tr><tr class="list-item"><td colspan="${tableHeader.length}">請輸入並搜尋想比價的作物名稱^＿^</td></tr>`;
    table.append(headerText);

    function dealData(data) {
        tableData = data;
        
        let category = $(".category-active").text();
        let cropName = $(".crop-name input[type=text]").val().trim();
        let categoryCodeArr = categoryList.find(x => x["種類"] == category)["代碼"];
        filterData = tableData.filter(function(item) {
            let check= false;
            // 對應蔬菜種類代碼
            if(categoryCodeArr.indexOf(item["種類代碼"]) != -1) {
                if(cropName == "") { // 未輸入作物名稱
                    check = true;
                } else {
                    // 對應作物名稱
                    if(item['作物名稱'].indexOf(cropName) != -1) {
                        check = true;
                    }
                    // 清空輸入作物名稱
                    $(".crop-name input[type=text]").val("");
                }
            }
            return check;
        });

        // 計算頁數
        pageAll = Math.ceil(filterData.length / onePageNum);
        pageNow = pageAll > 0 ? 1 : 0;
        // 顯示於畫面上
        showTable("done");
    }

    function showTable(staus) {   
        let windowWidth = $(window).width();   
        let listItem = '';
        $(table).find("tr").remove(".list-item");
        if(staus == "loading") {
            // 更新表格顯示資訊：資料載入中
            listItem = `<tr class="list-item"><td colspan="${tableHeader.length}">資料載入中...</td></tr>`;
            // 更新 h2 文字
            let category = $(".category-active").text();
            let cropName = $(".search input[type=text]").val().trim();
            if(cropName == "") {
                $("h2 span").text(`「${category}」的`);
            } else {
                $("h2 span").text(`「${cropName}」的`);
            }
            // $("h2 span").css("display", "block");
            $("h2 span").addClass("display");
        } else {
            if(pageAll == 0) {
                // 更新表格顯示資訊：查無資料
                listItem = `<tr class="list-item"><td colspan="${tableHeader.length}">查詢不到當日的交易資訊QQ</td></tr>`;
            } else {
                let count = 0;
                let i = (pageNow - 1) * onePageNum; // 依現行頁數計算起始位置
                for(; i < filterData.length && count < onePageNum; i++) {
                    listItem += `<tr class="list-item">`;
                    // 拆解 作物名稱
                    let cropNameArr = filterData[i]['作物名稱'].split('-');
                    listItem += `<td class="font-bold">${cropNameArr[0]}`;
                    if(cropNameArr[1] != undefined) {
                        listItem += `<span>-${cropNameArr[1]}</span>`;
                    }
                    listItem +=
                        `</td><td class="font-bold">${filterData[i]['市場名稱']}</td>` +
                        `<td>${filterData[i]['上價']}</td>` +
                        `<td>${filterData[i]['中價']}</td>` +
                        `<td>${filterData[i]['下價']}</td>` +
                        `<td>${filterData[i]['平均價']}</td>` +
                        `<td>${filterData[i]['交易量']}</td></tr>`;
                    count++;
                }
                showPage();
            }
        }
        $(table).append(listItem);
    }
    
    function showPage() {
        // 移除所有頁數
        $(".table-page li").remove(".page-num");
        // 判斷顯示頁數
        let count = 0;
        let prevElement = $(".page-prev");
        for(let i = -2; i < 5; i++) {
            let nextPage = pageNow + i;
            if(nextPage >= 1 && nextPage <= pageAll) {
                if(nextPage == pageNow){
                    $(`<li class="page-num page-num${nextPage} page-active" data-page=${nextPage}>${nextPage}</li>`).insertAfter($(prevElement));
                }
                else{
                    $(`<li class="page-num page-num${nextPage}" data-page=${nextPage}>${nextPage}</li>`).insertAfter($(prevElement));
                }
                prevElement = $(prevElement).parent().find(`li.page-num${nextPage}`);
                count++;
                // 畫面上頁數最多顯示 5 筆
                if(count == 5){
                    break;
                }
            }
        }
        // 更新 data-page
        $(".page-prev").attr("data-page", pageNow - 1);
        $(".page-next").attr("data-page", pageNow + 1);
        // 若目前頁數為 1，不可再向前翻頁
        if(pageNow == 1) {
            $(".page-prev").addClass("page-not-active");
        } else {
            $(".page-prev").removeClass("page-not-active");
        }
        // 若目前頁數為所有頁數，不可再向後翻頁
        if(pageNow == pageAll) {
            $(".page-next").addClass("page-not-active");
        } else {
            $(".page-next").removeClass("page-not-active");
        }
        $(".table-page").addClass("visible");
    }

    $(".category li").on("click", function () {
        $(".category li").removeClass("category-active");
        $(this).addClass("category-active");
    });

    $(".search-btn").on("click", function () {
        // 清空網頁暫存檔案
        tableData = [];
        dataLoadOK = false;
        // 移除所有 sort 畫面顯示
        $("table i").removeClass("sort-active");
        // 隱藏頁碼顯示
        $(".table-page").removeClass("visible");
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
        showTable("loading");
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
        // 移除所有 sort 效果
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
        showTable("done");
    });

    $(".table-page").on("click", function (e) {
        let element;
        if(e.target.nodeName === "I"){
            element = $(e.target).parent();
        } else if(e.target.nodeName === "LI") {
            element = $(e.target);
        } else {
            return;
        }
        if($(element).hasClass("page-not-active") || $(element).hasClass("page-active")) {
            return;
        }
        pageNow = parseInt($(element).attr("data-page"));
        showTable("done");
    });

    $(document).on('keypress',function(e) {
        console.log(e.which);
        if(e.which == 13) { // enter
            if($(".crop-name input[type='text']").is(":focus")) {
                $(".search-btn").click();
            }
        }
    });
});