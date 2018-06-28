var eventBus = new Vue();


Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">
    
    <p v-if="errors.length"> Correct these errors: 
        <ul>
            <li v-for="error in errors">{{ error }}</li>
        </ul>
    </p>
    
    <p>
      <label for="name">Name:</label>
      <input id="name" v-model="name" placeholder="name">
    </p>
    
    <p>
      <label for="review">Review:</label>      
      <textarea id="review" v-model="review"></textarea>
    </p>
    
    <p>
      <label for="rating">Rating:</label>
      <select id="rating" v-model.number="rating">
        <option>5</option>
        <option>4</option>
        <option>3</option>
        <option>2</option>
        <option>1</option>
      </select>
    </p>

        <h4>Would you recommend this product?</h4>
        <input type="radio" id="yes" value="Yes" v-model="recommend">
        <label for="one">Yes</label>
        <br>
        <input type="radio" id="no" value="No" v-model="recommend">
        <label for="no">No</label>
        
    <p>
      <input type="submit" value="Submit">  
    </p>    
  
  </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            this.errors = [];
            if (this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null;
                this.review = null;
                this.rating = null;
            } else {
                if (!this.name) this.errors.push("Name Required");
                if (!this.review) this.errors.push("Review Required");
                if (!this.rating) this.errors.push("Rating Required");
                if (!this.recommend) this.errors.push("Recommendation Required");
            }
        }
    }
})

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true,
        }
    },
    template: `
    <div class="product">
            
    <div class="product-image">
        <img v-bind:src="image">
    </div>

    <div class="product-info">
        <h1>{{ title }}</h1>
        <p v-if="inStock">In Stock</p>
        <p v-else :class="{ strikethrough: !inStock }">Out of Stock</p>
        <p v-show="onSale" style="color:red">On Sale</p>
        <p>Shipping: {{ shipping }} </p>
    
        <ul>
            <li v-for="detail in details">{{ detail }}</li>
        </ul>

        <div v-for="(variant, index) in variants" 
            :key="variant.variantId"
            class="color-box"
            :style="{backgroundColor: variant.variantColor}"
            @mouseover="updateProduct(index)">
        </div>

        <h3>Sizes:</h3>
        <ul>
            <li v-for="size in sizes">{{ size }}</li>
        </ul>
    
        <button v-on:click="addToCart"
                :disabled="!inStock"
                :class="{ disabledButton: !inStock}">Add to Cart</button> 

        <button v-on:click="removeFromCart">Remove from Cart</button>

        <product-tabs :reviews="reviews"></product-tabs>
        
    </div>
</div>
    `,
    data() {
        return {
            brand: 'Vue Mastery',
            product: 'Socks',
            description: "They're warm and fuzzy!",
            selectedVariant: 0,
            onSale: false,
            details: ["80% cotton", "20% Polyester", "Gender-neutral"],
            sizes: ["8", "9", "9.5", "10"],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: './assets/vmSocks-green-onWhite.jpg',
                    variantQuantity: 20
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: './assets/vmSocks-blue-onWhite.jpg',
                    variantQuantity: 8
                }
            ],
            reviews: []
        }
        },
        methods: {
            addToCart: function() {
                this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
            }, 
    
            updateProduct: function(index) {
                this.selectedVariant = index;
            },
    
            removeFromCart: function() {
                this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId);
            },
        },
    
        computed: {
            title() {
                return this.brand + ' ' + this.product;
            },
            image() {
                return this.variants[this.selectedVariant].variantImage;
            },
            inStock() {
                return this.variants[this.selectedVariant].variantQuantity;
            },
            shipping() {
                if (this.premium) {
                    return "Free!"
                } else {
                    return "$5.99"
                }
            }
        },
        mounted() {
            eventBus.$on('review-submitted', productReview => {
                this.reviews.push(productReview);
            })
        }

    })


Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: true
        }
    },
    template: `
    <div>
        <span class='tab'
            :class="{activeTab: selectedTab === tab}"
            v-for="(tab, index) in tabs"
            :key="index"
            @click="selectedTab = tab">
            {{ tab }} </span>
    
        <div v-show="selectedTab === 'Reviews' ">
            <p v-if="!reviews.length">There are no reviews yet. Add one Below!</p>
            <ul>
                <li v-for="review in reviews">
                    <p>{{ review.name }}</p>
                    <p>{{ review.review }}</p>
                    <p>Rating: {{ review.rating }}</p>
                </li>
            </ul>
        </div>
        
        <product-review v-show="selectedTab === 'Make a Review' "></product-review>
    
    </div>
    `,
    data() {
    return {
        tabs: ['Reviews', 'Make a Review'],
        selectedTab: 'Reviews'
    }
    },
    methods: {

    }
})


var app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        removeCart(id) {
            if (this.cart.length > 0) {
                let index = this.cart.indexOf(id);
                this.cart.splice(index, 1);
            }
        }
    }
});


