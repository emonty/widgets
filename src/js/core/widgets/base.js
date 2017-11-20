import EventBus from '../core/bus';
import CommonUtils from '../utils/common';
import Logger from "../core/logger";
import HtmlUtils from "../utils/html";
import Feed from "../core/feed";
import ajax from "../core/ajax";
import Events from "../core/events";
import Post from "../ui/post";
import Filter from "../ui/filter";
import PopupManager from "../ui/popup_manager";
import z from "../core/lib";

class Widget extends EventBus {

    constructor () {
        Logger.log('Widget->construct');

        super ();

        this.id = CommonUtils.uId ();
    }

    setOptions (options, defaults) {

        this.options = z.extend(true,{}, defaults, options);

        if (options.debug) {
            Logger.debug = true;
        }

        // Logger.log(this.options);

        return true;
    }

    init () {

        if (!HtmlUtils.checkContainer(this.options.container)) {
            return false;
        }

        this.$container = z(this.options.container);
        this.$container.addClass('crt-feed');

        this.createFeed();
        this.createFilter();
        this.createPopupManager();

        return true;
    }

    createFeed () {
        this.feed = new Feed (this);
        this.feed.on(Events.POSTS_LOADED, this.onPostsLoaded.bind(this));
        this.feed.on(Events.POSTS_FAILED, this.onPostsFail.bind(this));
        this.feed.on(Events.FEED_LOADED, this.onFeedLoaded.bind(this));
    }

    createPopupManager () {
        this.popupManager = new PopupManager(this);
    }

    createFilter () {
        Logger.log('Widget->createFilter');
        Logger.log(this.options.filter);

        if (this.options.filter && (this.options.filter.showNetworks || this.options.filter.showSources)) {

            this.filter = new Filter(this);
        }
    }

    loadPosts (page) {
        this.feed.loadPosts(page);
    }

    createPostElements (posts)
    {
        let that = this;
        let postElements = [];
        z(posts).each(function(){
            let p = that.createPostElement(this);
            postElements.push(p.$el);
        });
        return postElements;
    }

    createPostElement (postJson) {
        let post = new Post(postJson, this.options, this);
        post.on(Events.POST_CLICK,this.onPostClick.bind(this));
        post.on(Events.POST_CLICK_READ_MORE,this.onPostClick.bind(this));
        post.on(Events.POST_IMAGE_LOADED, this.onPostImageLoaded.bind(this));

        this.trigger(Events.POST_CREATED, post);

        return post;
    }

    onPostsLoaded (event, posts) {
        Logger.log('Widget->onPostsLoaded');
        Logger.log(event);
        Logger.log(posts);
    }

    onPostsFail (event, data) {
        Logger.log('Widget->onPostsLoadedFail');
        Logger.log(event);
        Logger.log(data);
    }

    onPostClick (ev, post, postJson) {
        Logger.log('Widget->onPostClick');
        Logger.log(ev);
        Logger.log(postJson);

        if (this.options.showPopupOnClick) {
            this.popupManager.showPopup(post);
        }
    }

    onPostImageLoaded (event, post) {
        Logger.log('Widget->onPostImageLoaded');
        Logger.log(event);
        Logger.log(post);
    }

    onFeedLoaded (ev, response) {
        if (!response.account.plan.unbranded) {
            this.$container.addClass('crt-feed-branded');
            //<a href="http://curator.io" target="_blank" class="crt-logo crt-tag">Powered by Curator.io</a>
        }
    }

    track (a) {
        Logger.log('Feed->track '+a);

        ajax.get (
            this.getUrl('/track/'+this.options.feedId),
            {a:a},
            (data) => {
                Logger.log('Feed->track success');
                Logger.log(data);
            },
            (jqXHR, textStatus, errorThrown) => {
                Logger.log('Feed->_loadPosts fail');
                Logger.log(textStatus);
                Logger.log(errorThrown);
            }
        );
    }

    getUrl (trail) {
        return this.options.apiEndpoint+trail;
    }

    destroy () {
        Logger.log('Widget->destroy');

        super.destroy();

        if (this.feed) {
            this.feed.destroy();
        }
        if (this.filter) {
            this.filter.destroy();
        }
        if (this.popupManager) {
            this.popupManager.destroy();
        }
        this.$container.removeClass('crt-feed');
    }
}

export default Widget;