(function () {
    // 动态创建和应用CSS样式
    const style = document.createElement('style');
    style.innerHTML = `
      .comment-box {
          margin-bottom: 20px;
      }

      .comment-box textarea {
          width: calc(100% - 20px - 2px);
          height: 80px;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 14px;
          resize: none;
      }

      .comment-box .line {
          display: flex;      
          margin-top: 10px;
      }

      .comment-box .line input {
          width: calc(100% - 20px);
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 14px;
          margin-right: 10px;
      }

      .comment-box .line button {
          padding: 8px 15px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          white-space: nowrap;
      }

      .comments {
          margin-top: 20px;
      }

      .comment {
          background: #f9f9f9;
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 5px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: solid 1px rgb(95 95 95 / 25%);
      }

      .comment-box hr {
          margin-block: auto;
      }

      .comment .line {
          display: flex;
          justify-content: flex-end;
      }

      .comment .line .comment-time {
          color: #666;
          font-size: 12px;
          margin: auto 0 auto 6px;
      }

      .comment .line .comment-name {
          font-weight: bold;
          max-width: 30%;
      }
    `;
    // 将样式插入到页面的head中
    document.head.appendChild(style);

    // 创建内容
    const comment = document.createElement('div');
    comment.className = 'comments';
    comment.innerHTML = `
      <div class="comment-box">
        <textarea id="comment" placeholder="输入你的评论（最多200字符）"></textarea>
        <div class="line">
          <input type="text" id="name" placeholder="输入你的署名（默认匿名）">
          <button id="submit-comment">提交评论</button>
        </div>
      </div>
      <div class="comments" id="comments"></div>
    `;
    // 将内容插入到页面
    document.body.appendChild(comment);

    document.body.innerHTML += `
    <script>
      const apiUrl = "/comments";

      // 获取并显示评论
      function loadComments() {
        fetch(apiUrl)
          .then(res => res.json())
          .then(data => {
            const commentsDiv = document.getElementById("comments");
            commentsDiv.innerHTML = "";
            data.forEach(comment => {
              comment.text = comment.text.replace(/\n/g,'<br>');
              const cmt = \`
              <div class="comment">
                <p>\${comment.text}</p>
                <hr>
                <div class="line">
                  <div class="comment-name">\${comment.name}</div>
                  <div class="comment-time">\${new Date(comment.time).toLocaleString()}</div>
                </div>
              </div>
              \`

              commentsDiv.insertAdjacentHTML("beforeend", cmt);
            });
          });
      }

      // 提交评论
      document.getElementById("submit-comment").addEventListener("click", () => {
        const comment = document.getElementById("comment").value.trim();
        const name = document.getElementById("name").value.trim() || "匿名";

        if (!comment || comment.length > 200) {
          noty(\`评论内容不能为空且不能超过200字符！\n当前\${comment.length}字符。\`);
          //alert("评论内容不能为空且不能超过200字符！");
          return;
        }
        if (name.includes('admin')) {
          noty('你不是管理员！');
          return;
        }

        fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment, name }),
        }).then(() => {
          document.getElementById("comment").value = "";
          document.getElementById("name").value = "";
          loadComments();
          noty('Done!');
        });
      });

      // 初始化加载评论
      loadComments();
      </script>
    `;
    
    document.body.innerHTML += '<script src="funcjs/noty.js"></script>';


})();

