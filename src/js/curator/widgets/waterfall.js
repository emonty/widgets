
import Widget from './base';
import ConfigWidgetWaterfall from '/curator/config/widget_waterfall';
import Logger from '/curator/core/logger';
import LayoutWaterfall from '/curator/ui/layout/waterfall';
import Events from '/curator/core/events';
import z from '/curator/core/lib';

class Waterfall extends Widget {

    constructor (options) {
        super ();

        if (this.init (options,  ConfigWidgetWaterfall)) {
            Logger.log("Waterfall->init with options:");
            Logger.log(this.options);

            this.$scroll = z('<div class="crt-feed-scroll"></div>').appendTo(this.$container);
            this.$feed = z('<div class="crt-feed"></div>').appendTo(this.$scroll);
            this.$container.addClass('crt-widget-waterfall');

            if (this.options.continuousScroll) {
                z(this.$scroll).scroll(() => {
                    let height = this.$scroll.height();
                    let cHeight = this.$feed.height();
                    let scrollTop = this.$scroll.scrollTop();
                    if (scrollTop >= cHeight - height) {
                        this.loadMorePosts();
                    }
                });
            }

            if (this.options.waterfall.showLoadMore) {
                // default to more
                this.$more = z('<div class="crt-load-more"><a href="#"><span>' + this._t('load-more') + '</span></a></div>')
                    .appendTo(this.$scroll);
                this.$more.find('a').on('click', (ev) => {
                    ev.preventDefault();
                    this.loadMorePosts();
                });
            }

            this.ui = new LayoutWaterfall({
                selector:'.crt-post-c',
                gutter:0,
                width:this.options.waterfall.gridWidth,
                animate:this.options.waterfall.animate,
                animationOptions: {
                    speed: (this.options.waterfall.animateSpeed/2),
                    duration: this.options.waterfall.animateSpeed
                }
            },this.$feed);

            this.on(Events.FILTER_CHANGED, () => {
                this.$feed.find('.crt-post').remove();
            });

            // Load first set of posts
            this.feed.load();

            this.iniListeners();
        }
    }

    iniListeners () {

    }

    destroyListeners () {

    }

    loadMorePosts  () {
        Logger.log('Waterfall->loadMorePosts');

        this.feed.loadAfter();
    }


    loadPage  (page) {
        Logger.log('Waterfall->loadPage');

        this.$feed.find('.crt-post').remove();

        this.feed.loadPosts(page);
    }

    onPostsLoaded (event, posts) {
        Logger.log("Waterfall->onPostsLoaded");

        let postElements = this.createPostElements (posts);

        //this.$feed.append(postElements);
        this.ui.append(postElements);

        let that = this;
        z.each(postElements,function () {
            let post = this;
            if (that.options.waterfall.showReadMore) {
                post.find('.crt-post')
                    .addClass('crt-post-show-read-more');
            }
        });

        if (this.options.waterfall.showLoadMore) {
            if (this.feed.allPostsLoaded) {
                this.$more.hide();
            } else {
                this.$more.show();
            }
        }

        this.popupManager.setPosts(posts);

        this.loading = false;

        this.trigger(Events.POSTS_RENDERED, this);
    }

    destroy  () {
        Logger.log('Waterfall->destroy');

        super.destroy();

        this.feed.destroy();

        this.ui.destroy ();

        this.$feed.remove();
        this.$scroll.remove();
        if (this.$more) {
            this.$more.remove();
        }
        this.$container.removeClass('crt-feed-container')
            .removeClass('crt-widget-waterfall');

        this.destroyListeners();

        delete this.$feed;
        delete this.$scroll;
        delete this.$container;
        delete this.options ;
        delete this.totalPostsLoaded;
        delete this.loading;
        delete this.allLoaded;

        // TODO add code to cascade destroy down to Feed & Posts
        // unregistering events etc
        delete this.feed;
    }
}

export default Waterfall;
