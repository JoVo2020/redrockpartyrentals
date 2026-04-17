

  const sessionId = sessionStorage.getItem("sessionId") || (() => {
    const id = "session-" + Date.now();
    sessionStorage.setItem("sessionId", id);
    return id;
  })();

  let hasExpanded = false;

  async function sendMessage() {
    const input = document.getElementById("user-input");
    const text = input.value.trim();
    if (!text) return;

    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<div class="chat-message user">${text}</div>`;
    input.value = "";

    // Show typing indicator
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "chat-message bot typing";
    typingIndicator.innerText = " ";
    typingIndicator.id = "typing-indicator";
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      const res = await fetch("https://joelvoss.app.n8n.cloud/webhook/b54205c4-c8a8-4f8e-93db-d6e885f6138e/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: text, sessionId })
      });

      const data = await res.json();
      const reply = data.output || "No response... please resend message";

	  const replyLower = String(reply).toLowerCase();

	  // ✅ WORKS NOW: basic phrase match (edit phrase to match your exact success wording)
	  const looksLikeBookingSuccess =
		  replyLower.includes("you're all set") ||
		  replyLower.includes("youre all set") ||
		  replyLower.includes("confirmation email") ||
		  replyLower.includes("booked") ||
		  replyLower.includes("appointment confirmed");

	  if (looksLikeBookingSuccess) {
		  trackBookingConversionOnce();
	  }

      typingIndicator.remove();
      chatBox.innerHTML += `<div class="chat-message bot">${reply}</div>`;

/* 
      if (!hasExpanded) {
        document.getElementById("chat-container").style.height = "96vh";
        hasExpanded = true;
      }
*/
    } catch (err) {
      typingIndicator.remove();
      chatBox.innerHTML += `<div class="chat-message bot">Error contacting server.</div>`;
    }

    chatBox.scrollTop = chatBox.scrollHeight;
  }
  
	function trackBookingConversionOnce() {
	  if (window.__rr_booking_conversion_fired) return;
	  window.__rr_booking_conversion_fired = true;

	  window.dataLayer = window.dataLayer || [];
	  window.dataLayer.push({ event: "rr_booking_confirmed" });

	  console.log("✅ Pushed rr_booking_confirmed to dataLayer");
	}

  document.addEventListener("DOMContentLoaded", function () {
    const input = document.querySelector("#user-input");
    const sendButton = document.querySelector("#chat-input button");

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        sendButton.click();
      }
    });
  });

  document.getElementById("user-input").addEventListener("focus", () => {
    const onResize = () => {
      const yOffset = window.visualViewport.offsetTop || 0;
      window.scrollTo({ top: yOffset, behavior: "smooth" });
    };

    window.visualViewport?.addEventListener("resize", onResize);

    document.getElementById("user-input").addEventListener("blur", () => {
      window.visualViewport?.removeEventListener("resize", onResize);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }, { once: true });
  });

