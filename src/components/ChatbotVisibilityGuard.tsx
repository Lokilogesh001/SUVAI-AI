import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Route-aware visibility guard for the floating chatbot widget.
 * Hides the chatbot completely on /auth and all sub-routes (/auth/*, /auth/callback, /auth?redirect=...),
 * while ensuring it remains visible and active on all normal application pages.
 */
export const ChatbotVisibilityGuard: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const isAuthRoute = location.pathname.startsWith("/auth");

    const updateChatbotVisibility = () => {
      // Find all floating chatbot widget containers (gptbots or third-party)
      const chatbotSelectors = [
        '[id*="gptbots" i]',
        '[class*="gptbots" i]',
        'iframe[src*="gptbots" i]',
        '#gptbots-bubble',
        '#gptbots-window',
        'div[data-gptbots]',
      ];

      const elements = document.querySelectorAll<HTMLElement>(chatbotSelectors.join(", "));

      elements.forEach((el) => {
        if (isAuthRoute) {
          el.style.setProperty("display", "none", "important");
          el.style.setProperty("visibility", "hidden", "important");
          el.style.setProperty("pointer-events", "none", "important");
          el.style.setProperty("opacity", "0", "important");
          el.setAttribute("aria-hidden", "true");
        } else {
          el.style.removeProperty("display");
          el.style.removeProperty("visibility");
          el.style.removeProperty("pointer-events");
          el.style.removeProperty("opacity");
          el.removeAttribute("aria-hidden");
        }
      });
    };

    if (isAuthRoute) {
      document.body.classList.add("hide-chatbot");
      document.documentElement.classList.add("hide-chatbot");
    } else {
      document.body.classList.remove("hide-chatbot");
      document.documentElement.classList.remove("hide-chatbot");
    }

    updateChatbotVisibility();

    // Observe asynchronous injections from chat.js
    const observer = new MutationObserver(() => {
      updateChatbotVisibility();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [location.pathname]);

  return null;
};

export default ChatbotVisibilityGuard;
