# Add project specific ProGuard rules here.
# Firebase
-keep class com.google.firebase.messaging.** { *; }
-keep class com.google.android.gms.** { *; }

# Kotlinx Serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt

-keepclassmembers class kotlinx.serialization.json.** {
    *** Companion;
}
-keepclassesmembers class kotlinx.serialization.json.internal.** { *; }

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase
