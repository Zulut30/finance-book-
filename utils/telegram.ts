
export const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
    // HapticFeedback is available since 6.1
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
};

export const triggerNotification = (type: 'error' | 'success' | 'warning') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
    }
};

export const showConfirm = (message: string, callback: (confirmed: boolean) => void) => {
    const tg = window.Telegram?.WebApp;
    // showPopup requires version 6.2+
    if (tg && tg.showPopup && tg.isVersionAtLeast && tg.isVersionAtLeast('6.2')) {
        tg.showPopup({
            message: message,
            buttons: [
                { id: 'cancel', type: 'cancel' },
                { id: 'ok', type: 'destructive', text: 'OK' },
            ]
        }, (buttonId) => {
            callback(buttonId === 'ok');
        });
    } else {
        // Fallback for older versions or browser
        // window.confirm might block some UIs but it's the standard fallback
        callback(window.confirm(message));
    }
};

export const showAlert = (title: string, message: string, callback?: () => void) => {
    const tg = window.Telegram?.WebApp;
    // showPopup requires version 6.2+
    if (tg && tg.showPopup && tg.isVersionAtLeast && tg.isVersionAtLeast('6.2')) {
         tg.showPopup({
            title: title,
            message: message,
            buttons: [{type: 'ok', text: 'OK'}]
        }, () => {
             if (callback) callback();
        });
    } else {
        window.alert(`${title ? title + '\n\n' : ''}${message}`);
        if (callback) callback();
    }
};
