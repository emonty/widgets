/**
* ==================================================================
* Popup Manager
* ==================================================================
*/


Curator.PopupManager = function (curator) {
    // console.log (this);
    this.init(curator);
};


jQuery.extend(Curator.PopupManager.prototype, {
    templateId:'#popup-wrapper-template',

    init: function (curator) {
        Curator.log("PopupManager->init ");

        this.$wrapper = Curator.Template.render(this.templateId, {});
        this.$popupContainer = this.$wrapper.find('.crt-popup-container');
        this.$underlay = this.$wrapper.find('.crt-popup-underlay');

        console.log (this.$wrapper);

        jQuery('body').append(this.$wrapper);
        this.$underlay.click(jQuery.proxy(this.onUnderlayClick,this));
        this.$popupContainer.click(jQuery.proxy(this.onUnderlayClick,this));

    },

    showPopup: function (post) {
        if (this.popup) {
            this.popup.hide(function(){
                this.popup.destroy();
                this.showPopup2(post);
            }.bind(this));
        } else {
            this.showPopup2(post);
        }

    },

    showPopup2: function (post) {
        this.popup = new Curator.Popup(this, post, this.feed);
        this.$popupContainer.append(this.popup.$popup);

        this.$wrapper.show();
        if (!this.$underlay.is(':visible')) {
            this.$underlay.fadeIn();
        }
        this.popup.show();

        jQuery('body').addClass('crt-popup-visible');

        this.currentPostNum = 0;
        for(var i=0;i < this.posts.length;i++)
        {
            // console.log (post.json.id +":"+this.posts[i].id);
            if (post.json.id == this.posts[i].id) {
                this.currentPostNum = i;
                Curator.log('Found post '+i);
                break;
            }
        }
    },

    setPosts: function (posts) {
        this.posts = posts;
    },

    onClose : function () {
        this.hide();
    },

    onPrevious: function () {
        this.currentPostNum-=1;
        this.currentPostNum = this.currentPostNum>=0?this.currentPostNum:this.posts.length-1; // loop back to start

        this.showPopup({json:this.posts[this.currentPostNum]});
    },

    onNext: function () {
        this.currentPostNum+=1;
        this.currentPostNum = this.currentPostNum<this.posts.length?this.currentPostNum:0; // loop back to start

        this.showPopup({json:this.posts[this.currentPostNum]});
    },

    onUnderlayClick: function (e) {
        Curator.log('PopupManager->onUnderlayClick');
        e.preventDefault();

        this.popup.hide(function(){
            this.hide();
        }.bind(this));

    },

    hide: function (e) {

        Curator.log('PopupManager->hide');
        jQuery('body').removeClass('crt-popup-visible');
        this.currentPostNum = 0;
        this.popup = null;
        this.$underlay.fadeOut(function(){
            this.$wrapper.hide();
        }.bind(this));
    },
    
    destroy: function () {

        this.$underlay.remove();

        delete this.$popup;
        delete this.$underlay;
    }
});